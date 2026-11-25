"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Boxes, ChevronDown, ImagePlus, Layers, ShieldCheck } from "lucide-react";
import { assetHref, collectionHref, getService, profileHref } from "@medialane/sdk";
import { useImageUpload } from "../../utils/use-image-upload.js";
import { ImageUploadField } from "../image-upload-field.js";
import { FIELD_LIMITS } from "../../utils/field-limits.js";
import { mintedTokenIdFromReceipt } from "@medialane/sdk/starknet";
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
import { webLinkField } from "../../utils/launchpad-rules.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { pinAssetMetadata, uploadFileToIpfs } from "../../utils/ipfs-upload.js";
import { useCollectionsByOwner } from "../../utils/use-collections.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import type { MetadataField } from "../ip-type-fields.js";
import { useT } from "../../i18n/provider.js";
import { ActionButton } from "../action-button.js";
import { msg } from "../../i18n/translate.js";

const schema = z.object({
  collectionId: z.string().min(1, msg("Select a collection")),
  name: z.string().min(1, msg("Name required")).max(FIELD_LIMITS.name),
  description: z.string().max(FIELD_LIMITS.description).optional(),
  external_url: webLinkField(),
  ipType: z.enum(IP_TYPES),
  licenseType: z.string().min(1, msg("License required")),
  commercialUse: z.enum(["Yes", "No"]),
  derivatives: z.enum(["Allowed", "Not Allowed", "Share-Alike"]),
  attribution: z.enum(["Required", "Not Required"]),
  geographicScope: z.string(),
  aiPolicy: z.enum(["Allowed", "Not Allowed", "Training Only"]),
  royalty: z.coerce.number().min(0).max(50),
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
  aiPolicy: "Allowed",
  royalty: 0,
};

function suggestedExternalUrl(collection: { contractAddress?: string | null } | null): string {
  return collection?.contractAddress ? `https://medialane.io${collectionHref("STARKNET", collection.contractAddress)}` : "";
}

export function SingleEditionMint({ aside }: { aside?: ReactNode }) {
  const t = useT();
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const { collections: allCollections, isLoading: collectionsLoading } = useCollectionsByOwner(walletAddress ?? null);
  const collections = allCollections.filter((c) => getService(c.service)?.id === "mip-erc721" && c.collectionId != null);

  const upload = useImageUpload();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [ipTypeOpen, setIpTypeOpen] = useState(false);
  const [metadataResetKey, setMetadataResetKey] = useState(0);
  const metadataFieldsRef = useRef<MetadataField[]>([]);

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULTS });
  const selectedCollectionId = form.watch("collectionId");
  const selectedCollection = collections.find((c) => c.collectionId === selectedCollectionId) ?? null;

  useEffect(() => {
    if (collections.length > 0 && !form.getValues("collectionId")) form.setValue("collectionId", collections[0]!.collectionId!);
  }, [collections, form]);

  const suggestedUrl = suggestedExternalUrl(selectedCollection);
  const autoUrlRef = useRef("");

  useEffect(() => {
    if (!suggestedUrl) return;
    const current = form.getValues("external_url");
    if (!current || current === autoUrlRef.current) {
      form.setValue("external_url", suggestedUrl);
      autoUrlRef.current = suggestedUrl;
    }
  }, [suggestedUrl, form]);

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
    const first = collections[0] ?? null;
    autoUrlRef.current = suggestedExternalUrl(first);
    form.reset({ ...DEFAULTS, collectionId: first?.collectionId ?? "", external_url: autoUrlRef.current });
    metadataFieldsRef.current = [];
    setMetadataResetKey((key) => key + 1);
    upload.clear();
  };

  const onSubmit = (values: FormValues) => {
    if (!upload.confirm()) return;
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
        imageUri: upload.uri,
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
  const busy = tx.phase !== "idle" || upload.uploading || collectionsLoading || collections.length === 0;

  return (
    <WalletRequired
      icon={ImagePlus}
      iconClassName="text-brand-blue"
      title={t("Secure your account to publish")}
      description={t("Publish a single-copy work.")}
    >
      <TransactionDialog tx={tx} title={t("Publish a work")} workingLabel={t("Publishing your work…")} firstStepLabel={t("Saving your work")}>
        <TransactionSuccess
          name={form.getValues("name") || t("Your work")}
          image={upload.preview}
          title={t("Work published")}
          description={t("License terms are recorded with the work.")}
          actions={[
            ...(mintedHref ? [{ href: mintedHref, label: t("View work") }] : []),
            { href: "/portfolio/assets", label: t("View portfolio") },
            { label: t("Publish another"), onClick: handleAgain },
          ]}
        >
          <RewardEarned actionType="mint_asset" />
        </TransactionSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<ImagePlus className="h-4 w-4 text-white" />}
        title={t("Publish a work")}
        subtitle={t("Publish a single-copy work.")}
        aside={
          <>
            <MedialaneCollectionCard
              image={upload.preview}
              name={form.watch("name")}
              collection={selectedCollection?.name || t("Work")}
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
                <FormLabel className="flex items-center gap-1.5"><Boxes className="h-4 w-4" />{t("Collection")}</FormLabel>
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

            <ImageUploadField upload={upload} label={t("Cover image")} alt={t("Preview")} optional />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl><Input placeholder={t("The title people will see")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Description")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                <FormControl><Textarea placeholder={t("Tell the story behind this work")} rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="external_url" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Link")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                <FormControl><Input placeholder={t("https://yourwebsite.com")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <CollapsibleSection
              open={licensingOpen}
              onOpenChange={setLicensingOpen}
              icon={<ShieldCheck className="h-4 w-4 text-primary" />}
              label={t("License terms")}
              hint={t("Optional · Berne Convention")}
            >
              <FormField control={form.control} name="licenseType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("License")}</FormLabel>
                  <Select value={field.value} onValueChange={handleLicenseChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{t(l.label)}</SelectItem>)}</SelectContent>
                  </Select>
                  {(() => { const def = LICENSE_TYPES.find((l) => l.value === field.value); return def ? <p className="text-xs text-muted-foreground mt-1">{t(def.description)}</p> : null; })()}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="commercialUse" render={({ field }) => (
                <FormItem><FormLabel>{t("Commercial use")}</FormLabel><ToggleGroup value={field.value} options={["Yes", "No"]} onChange={field.onChange} /></FormItem>
              )} />
              <FormField control={form.control} name="derivatives" render={({ field }) => (
                <FormItem><FormLabel>{t("Derivatives")}</FormLabel><ToggleGroup value={field.value} options={DERIVATIVES_OPTIONS} onChange={field.onChange} /></FormItem>
              )} />
              <FormField control={form.control} name="attribution" render={({ field }) => (
                <FormItem><FormLabel>{t("Attribution")}</FormLabel><ToggleGroup value={field.value} options={["Required", "Not Required"]} onChange={field.onChange} /></FormItem>
              )} />
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
                    {t("Advanced options")}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <FormField control={form.control} name="geographicScope" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Territory")}</FormLabel>
                      <FormControl><Input placeholder={t("Worldwide")} {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="aiPolicy" render={({ field }) => (
                    <FormItem><FormLabel>{t("AI & data mining")}</FormLabel><ToggleGroup value={field.value} options={AI_POLICIES} onChange={field.onChange} /></FormItem>
                  )} />
                  <FormField control={form.control} name="royalty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Royalty % (0–50)")}</FormLabel>
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
              label={t("More details")}
              hint={t("Optional")}
            >
              <FormField control={form.control} name="ipType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Type of work")}</FormLabel>
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

            <ActionButton solid big type="submit" disabled={busy} className="w-full">
              {t("Publish")}
            </ActionButton>
            <p className="text-xs text-center text-muted-foreground">{t("Free to publish.")}</p>
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
