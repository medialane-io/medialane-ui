"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Boxes, ChevronDown, ImagePlus, Layers, ShieldCheck, Upload } from "lucide-react";
import { assetHref, collectionHref, getService, profileHref } from "@medialane/sdk";
import { acceptFor, uploadError } from "../../utils/upload-limits.js";
import { FIELD_LIMITS } from "../../utils/field-limits.js";
import { mintedTokenIdFromReceipt } from "@medialane/sdk/starknet";
import Image from "../image.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { CollapsibleSection } from "../collapsible-section.js";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { ToggleGroup } from "../create-form-primitives.js";
import { IPTypeFields } from "../ip-type-fields.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { CollectionPicker } from "./collection-picker.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES, type IPType } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { pinAssetMetadata, uploadFileToIpfs } from "../../utils/ipfs-upload.js";
import { useCollectionsByOwner } from "../../utils/use-collections.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import type { MetadataField } from "../ip-type-fields.js";

const schema = z.object({
  collectionId: z.string().min(1, "Select a collection"),
  name: z.string().min(1, "Name required").max(FIELD_LIMITS.name),
  description: z.string().max(FIELD_LIMITS.description).optional(),
  external_url: z
    .string()
    .max(500)
    .refine((v) => !v || v.startsWith("http://") || v.startsWith("https://"), { message: "Must start with http:// or https://" })
    .optional(),
  ipType: z.enum(IP_TYPES),
  licenseType: z.string().min(1, "License required"),
  commercialUse: z.enum(["Yes", "No"]),
  derivatives: z.enum(["Allowed", "Not Allowed", "Share-Alike"]),
  attribution: z.enum(["Required", "Not Required"]),
  geographicScope: z.string(),
  aiPolicy: z.enum(["Allowed", "Not Allowed", "Training Only"]),
  royalty: z.coerce.number().min(0).max(50),
  image: z.instanceof(File).optional(),
});
type FormValues = z.infer<typeof schema>;

const DEFAULTS: FormValues = {
  collectionId: "",
  name: "",
  description: "",
  external_url: "",
  ipType: "NFT",
  licenseType: "CC BY-SA",
  commercialUse: "Yes",
  derivatives: "Share-Alike",
  attribution: "Required",
  geographicScope: "Worldwide",
  aiPolicy: "Not Allowed",
  royalty: 0,
};

export function SingleEditionMint({ aside }: { aside?: ReactNode }) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const { collections: allCollections, isLoading: collectionsLoading } = useCollectionsByOwner(walletAddress ?? null);
  const collections = allCollections.filter((c) => getService(c.service)?.id === "mip-erc721" && c.collectionId != null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [ipTypeOpen, setIpTypeOpen] = useState(false);
  const [metadataResetKey, setMetadataResetKey] = useState(0);
  const metadataFieldsRef = useRef<MetadataField[]>([]);
  const previewUrlRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const selectedCollectionId = form.watch("collectionId");
  const selectedCollection = collections.find((c) => c.collectionId === selectedCollectionId) ?? null;

  useEffect(() => {
    if (collections.length > 0 && !form.getValues("collectionId")) form.setValue("collectionId", collections[0]!.collectionId!);
  }, [collections, form]);

  useEffect(() => {
    if (selectedCollection?.contractAddress && !form.getValues("external_url")) {
      form.setValue("external_url", `https://medialane.io${collectionHref("STARKNET", selectedCollection.contractAddress)}`);
    }
  }, [selectedCollection?.contractAddress, form]);

  const handleLicenseChange = (value: string) => {
    form.setValue("licenseType", value);
    const def = LICENSE_TYPES.find((l) => l.value === value);
    if (def) {
      form.setValue("commercialUse", def.commercialUse);
      form.setValue("derivatives", def.derivatives);
      form.setValue("attribution", def.attribution);
    }
  };

  const uploadDocument = async (file: File) => {
    await app.ensureSignedIn?.();
    return (await uploadFileToIpfs(app.getClient().api, file, "document")).uri;
  };

  const handleAgain = () => {
    tx.reset();
    form.reset({ ...DEFAULTS, collectionId: collections[0]?.collectionId ?? "" });
    metadataFieldsRef.current = [];
    setMetadataResetKey((key) => key + 1);
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const onSubmit = (values: FormValues) => {
    if (!walletAddress) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const pinned = await pinAssetMetadata(api, {
        name: values.name,
        description: values.description ?? "",
        externalUrl: values.external_url,
        creator: walletAddress,
        ipType: values.ipType,
        licenseType: values.licenseType,
        commercialUse: values.commercialUse,
        derivatives: values.derivatives,
        attribution: values.attribution,
        geographicScope: values.geographicScope,
        aiPolicy: values.aiPolicy,
        royalty: String(values.royalty),
        imageFile,
        templateTraits: metadataFieldsRef.current.filter((f) => f.traitType.trim() && f.value.trim()).map((f) => ({ traitType: f.traitType.trim(), value: f.value.trim() })),
      });
      await runIntentCalls(signer, () =>
        api.intents.create("mint", {
          owner: walletAddress,
          collectionId: values.collectionId,
          recipient: walletAddress,
          tokenUri: pinned.uri,
          royaltyBps: Math.round(values.royalty * 100),
        }),
      );
      invalidatePortfolioCache(walletAddress);
    });
  };

  const mintedTokenId = tx.receipt && selectedCollection ? mintedTokenIdFromReceipt(tx.receipt, selectedCollection.contractAddress) : null;
  const mintedHref = mintedTokenId && selectedCollection ? assetHref("STARKNET", selectedCollection.contractAddress, mintedTokenId) : null;
  const busy = tx.phase !== "idle" || collectionsLoading || collections.length === 0;

  return (
    <WalletRequired
      icon={ImagePlus}
      iconClassName="text-brand-blue"
      title="Secure your account to create"
      description="Publish your creative work as a single-copy NFT in a collection you own."
    >
      <TransactionDialog tx={tx} title="Mint NFT" workingLabel="Minting your work…" firstStepLabel="Upload to IPFS">
        <TransactionSuccess
          name={form.getValues("name") || "Your asset"}
          image={imagePreview}
          title="Asset minted"
          description="Your wallet is the owner. The license terms and royalty are recorded in its metadata."
          actions={[
            ...(mintedHref ? [{ href: mintedHref, label: "View asset" }] : []),
            { href: "/portfolio/assets", label: "View portfolio" },
            { label: "Mint another", onClick: handleAgain },
          ]}
        >
          <RewardEarned actionType="mint_asset" />
        </TransactionSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<ImagePlus className="h-4 w-4 text-white" />}
        title="Mint NFT"
        subtitle="Publish your creative work as a single-copy NFT in a collection you own — free to mint, and it's yours."
        aside={
          <>
            <MedialaneCollectionCard
              image={imagePreview}
              name={form.watch("name")}
              collection={selectedCollection?.name || "IP Asset"}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
            />
            {aside}
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="collectionId" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5"><Boxes className="h-4 w-4" />Collection *</FormLabel>
                <CollectionPicker
                  collections={collections}
                  loading={collectionsLoading}
                  value={field.value}
                  onChange={field.onChange}
                  newCollectionHref="/launchpad/single-editions/collection"
                />
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Cover image</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                role="button"
                tabIndex={0}
                aria-label="Upload image"
                onClick={() => imageInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); imageInputRef.current?.click(); } }}
              >
                {imagePreview ? (
                  <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-lg">
                    <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <p className="text-sm">Click to upload (JPG, PNG, GIF, SVG, WebP)</p>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept={acceptFor("image")}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const fileError = uploadError(file, "image");
                    if (fileError) {
                      form.setError("image", { message: fileError });
                      e.target.value = "";
                      return;
                    }
                    form.clearErrors("image");
                    setImageFile(file);
                    form.setValue("image", file);
                    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                    const objectUrl = URL.createObjectURL(file);
                    previewUrlRef.current = objectUrl;
                    setImagePreview(objectUrl);
                  }}
                />
              </div>
              {form.formState.errors.image && <p role="alert" className="text-sm text-destructive">{form.formState.errors.image.message}</p>}
            </div>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input placeholder="My Creative Work" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Describe your work, its story, and any context for buyers…" rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="external_url" render={({ field }) => (
              <FormItem>
                <FormLabel>External link <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl><Input placeholder="https://yourwebsite.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <CollapsibleSection
              open={licensingOpen}
              onOpenChange={setLicensingOpen}
              icon={<ShieldCheck className="h-4 w-4 text-primary" />}
              label="Licensing Terms"
              hint="Optional · Berne Convention"
            >
              <p className="text-xs text-muted-foreground">Set how others can use your work. These terms are saved permanently with it as proof of authorship.</p>
              <FormField control={form.control} name="licenseType" render={({ field }) => (
                <FormItem>
                  <FormLabel>License</FormLabel>
                  <Select value={field.value} onValueChange={handleLicenseChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                  </Select>
                  {(() => { const def = LICENSE_TYPES.find((l) => l.value === field.value); return def ? <p className="text-xs text-muted-foreground mt-1">{def.description}</p> : null; })()}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="commercialUse" render={({ field }) => (
                <FormItem><FormLabel>Commercial Use</FormLabel><ToggleGroup value={field.value} options={["Yes", "No"]} onChange={field.onChange} /></FormItem>
              )} />
              <FormField control={form.control} name="derivatives" render={({ field }) => (
                <FormItem><FormLabel>Derivatives</FormLabel><ToggleGroup value={field.value} options={DERIVATIVES_OPTIONS} onChange={field.onChange} /></FormItem>
              )} />
              <FormField control={form.control} name="attribution" render={({ field }) => (
                <FormItem><FormLabel>Attribution</FormLabel><ToggleGroup value={field.value} options={["Required", "Not Required"]} onChange={field.onChange} /></FormItem>
              )} />
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
                    Advanced options
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <FormField control={form.control} name="geographicScope" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Territory</FormLabel>
                      <FormControl><Input placeholder="Worldwide" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="aiPolicy" render={({ field }) => (
                    <FormItem><FormLabel>AI &amp; Data Mining</FormLabel><ToggleGroup value={field.value} options={AI_POLICIES} onChange={field.onChange} /></FormItem>
                  )} />
                  <FormField control={form.control} name="royalty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Royalty % (0–50)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={50} step={0.5} placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CollapsibleContent>
              </Collapsible>
            </CollapsibleSection>

            <CollapsibleSection
              open={ipTypeOpen}
              onOpenChange={setIpTypeOpen}
              icon={<Layers className="h-4 w-4 text-primary" />}
              label="IP Type &amp; Metadata"
              hint="Optional"
            >
              <p className="text-xs text-muted-foreground">Choose a content type, fill suggested metadata, or add your own trait pairs.</p>
              <FormField control={form.control} name="ipType" render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{IP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
              )} />
              <IPTypeFields
                key={metadataResetKey}
                ipType={form.watch("ipType") as IPType}
                onChange={(fields) => { metadataFieldsRef.current = fields; }}
                uploadDocument={uploadDocument}
              />
            </CollapsibleSection>

            <button
              type="submit"
              disabled={busy}
              className={`w-full h-12 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] bg-brand-blue ${busy ? "opacity-40 pointer-events-none" : ""}`}
            >
              Mint NFT
            </button>
            <p className="text-xs text-center text-muted-foreground">Free to mint — protocol fee is zero.</p>
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
