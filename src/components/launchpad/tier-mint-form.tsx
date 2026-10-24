"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ChevronDown, ImagePlus, Loader2, ShieldCheck, X } from "lucide-react";
import { FIELD_LIMITS, acceptFor, collectionHref, normalizeAddress, profileHref } from "@medialane/sdk";
import Image from "../image.js";
import Link from "../link.js";
import { Button } from "../button.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Skeleton } from "../skeleton.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { ToggleGroup } from "../create-form-primitives.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { CreationSuccess } from "../creation-success.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, LICENSE_TYPES } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";
import { runIntentsCalls } from "../../utils/run-intent-calls.js";
import { pinAssetMetadata } from "../../utils/ipfs-upload.js";
import { useCollection } from "../../utils/use-collections.js";
import { useCollectionProfile } from "../../utils/use-profiles.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useLaunchpadImageUpload } from "../../utils/use-launchpad-image-upload.js";
import type { TierMintPreset } from "./tier-mint-presets.js";

function dateToUnixTimestamp(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  return Math.floor(d.getTime() / 1000);
}

function makeSchema(preset: TierMintPreset) {
  return z.object({
    name: z.string().min(1, preset.copy.nameRequired).max(FIELD_LIMITS.name),
    description: z.string().max(FIELD_LIMITS.description).optional(),
    external_url: z
      .string()
      .max(500)
      .refine((v) => !v || v.startsWith("http://") || v.startsWith("https://"), { message: "Must start with http:// or https://" })
      .optional(),
    maxSupply: z
      .string()
      .min(1, "Supply required")
      .regex(/^\d+$/, "Must be a positive integer")
      .refine((v) => parseInt(v, 10) >= 1, "Minimum supply is 1"),
    royalty: z.coerce.number().min(0).max(50).default(2.5),
    licenseType: z.string().min(1),
    commercialUse: z.enum(["Yes", "No"]),
    derivatives: z.enum(["Allowed", "Not Allowed", "Share-Alike"]),
    attribution: z.enum(["Required", "Not Required"]),
    geographicScope: z.string(),
    aiPolicy: z.enum(["Allowed", "Not Allowed", "Training Only"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    imageUri: z.string().min(1, preset.copy.imageRequired),
  });
}
type FormValues = z.infer<ReturnType<typeof makeSchema>>;

export interface TierMintFormProps {
  contract: string;
  preset: TierMintPreset;
  aside?: ReactNode;
}

export function TierMintForm({ contract: rawContract, preset, aside }: TierMintFormProps) {
  const app = useMedialaneApp();
  const address = app.walletAddress;
  const contract = normalizeAddress("STARKNET", rawContract);
  const { collection, isLoading } = useCollection(contract);
  const { profile, isLoading: profileLoading } = useCollectionProfile(preset.suggestExternalLink ? contract : undefined);
  const tx = useTransaction();
  const upload = useLaunchpadImageUpload({ successMessage: "Image uploaded" });
  const { imagePreview, imageUri, imageUploading, uploadError, fileInputRef, handleImageSelect, clearImage } = upload;
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const Icon = preset.icon;

  const form = useForm<FormValues>({
    resolver: zodResolver(makeSchema(preset)),
    defaultValues: {
      name: "", imageUri: "", description: "", external_url: "",
      maxSupply: "100", royalty: 2.5, licenseType: "CC BY-SA", commercialUse: "Yes",
      derivatives: "Share-Alike", attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Not Allowed",
    },
  });

  useEffect(() => {
    form.setValue("imageUri", imageUri ?? "", { shouldValidate: !!imageUri });
  }, [imageUri, form]);

  useEffect(() => {
    if (!preset.suggestExternalLink || profileLoading) return;
    const suggested = profile?.slug ? `https://medialane.io/collection/${profile.slug}` : `https://medialane.io${collectionHref("STARKNET", contract)}`;
    if (!form.getValues("external_url")) form.setValue("external_url", suggested);
  }, [contract, profileLoading, profile?.slug, form, preset.suggestExternalLink]);

  const isOwner = !!address && !!collection?.owner && normalizeAddress("STARKNET", address) === normalizeAddress("STARKNET", collection.owner);

  const handleAgain = () => {
    tx.reset();
    form.reset({ ...form.getValues(), name: "", description: "", maxSupply: "100" });
    clearImage();
  };

  const onSubmit = (values: FormValues) => {
    if (!address) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const pinned = await pinAssetMetadata(api, {
        name: values.name,
        description: values.description ?? "",
        imageUri: imageUri!,
        externalUrl: values.external_url,
        ipType: "NFT",
        licenseType: values.licenseType,
        commercialUse: values.commercialUse,
        derivatives: values.derivatives,
        attribution: values.attribution,
        geographicScope: values.geographicScope,
        aiPolicy: values.aiPolicy,
        royalty: String(values.royalty),
        creator: address,
        templateTraits: [
          { traitType: "Type", value: preset.traitType },
          { traitType: "Token Standard", value: "ERC-1155" },
          { traitType: "Max Supply", value: values.maxSupply },
          { traitType: "Collection Contract", value: contract },
        ],
      });
      const tierId = await preset.predictNextId(api, contract);
      const tierRes = await api.intents.create("create-tier", {
        owner: address,
        collection: contract,
        service: preset.service,
        maxSupply: values.maxSupply,
        startTime: dateToUnixTimestamp(values.startDate),
        endTime: dateToUnixTimestamp(values.endDate),
        royaltyBps: Math.round(values.royalty * 100),
        metadataUri: pinned.uri,
      });
      const mintRes = await api.intents.create("mint", {
        owner: address,
        recipient: address,
        collectionContract: contract,
        tokenId: String(tierId),
        amount: values.maxSupply,
      });
      await runIntentsCalls(signer, [tierRes, mintRes]);
    });
  };

  const gateProps = { icon: Icon, iconClassName: preset.iconClass, title: preset.signedOut.title, description: preset.signedOut.description };
  const inputId = `mint-${preset.service}-file-input`;
  const busy = tx.phase !== "idle" || imageUploading;

  if (isLoading) {
    return (
      <WalletRequired {...gateProps}>
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-16 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </WalletRequired>
    );
  }

  if (!collection) {
    return (
      <WalletRequired {...gateProps}>
        <div className="max-w-xl mx-auto px-4 pt-24 pb-8 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto" />
          <p className="text-muted-foreground">Collection not found.</p>
          <Button asChild variant="outline" size="sm"><Link href={preset.back.href}>{preset.back.label}</Link></Button>
        </div>
      </WalletRequired>
    );
  }

  if (!isOwner) {
    return (
      <WalletRequired {...gateProps}>
        <div className="max-w-xl mx-auto px-4 pt-24 pb-8 text-center space-y-4">
          <Icon className="h-10 w-10 text-muted-foreground/20 mx-auto" />
          <p className="text-muted-foreground">{preset.notOwner.message}</p>
          <Button asChild variant="outline" size="sm"><Link href={preset.notOwner.back.href}>{preset.notOwner.back.label}</Link></Button>
        </div>
      </WalletRequired>
    );
  }

  return (
    <WalletRequired {...gateProps}>
      <TransactionDialog tx={tx} title={preset.dialog.title} workingLabel={preset.dialog.workingLabel} firstStepLabel={preset.dialog.firstStepLabel}>
        <CreationSuccess
          name={form.getValues("name")}
          image={imagePreview}
          caption={preset.success.caption}
          primary={{ href: collectionHref("STARKNET", contract), label: "View collection" }}
          onAgain={handleAgain}
          againLabel={preset.success.againLabel}
        >
          <RewardEarned actionType="launch_launchpad" />
        </CreationSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<Icon className="h-4 w-4 text-white" />}
        title={preset.shell.title}
        subtitle={preset.shell.subtitle(collection.name ?? null)}
        aside={
          <>
            <MedialaneCollectionCard
              image={imagePreview}
              name={form.watch("name")}
              collection={collection.symbol || preset.cardFallbackSymbol}
              creator={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : undefined}
              creatorHref={address ? profileHref({ address }) : undefined}
            />
            {aside}
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">{preset.copy.imageHeading} <span className="text-destructive">*</span></p>
              <div className="flex items-center gap-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => !imageUploading && fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click(); }}
                  className={cn("relative h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-colors", preset.hoverBorderClass)}
                >
                  {imagePreview ? <Image src={imagePreview} alt={preset.copy.imageAlt} fill unoptimized className="object-cover" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                  {imageUploading && <div className="absolute inset-0 bg-background/70 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                </div>
                <div className="space-y-1.5">
                  <input id={inputId} ref={fileInputRef} type="file" accept={acceptFor("image")} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageSelect(f); }} />
                  <Button type="button" variant="outline" size="sm" disabled={imageUploading} onClick={() => fileInputRef.current?.click()}>
                    {imageUploading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Uploading…</> : imagePreview ? "Change" : "Upload image"}
                  </Button>
                  {imagePreview && (
                    <button type="button" onClick={clearImage} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3 w-3" /> Remove
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">{imageUri ? <span className={preset.uploadedClass}>✓ Uploaded</span> : "JPG, PNG, SVG or WebP"}</p>
                </div>
              </div>
            </div>

            {(uploadError || form.formState.errors.imageUri) && (
              <p role="alert" className="text-sm text-destructive">{uploadError ?? form.formState.errors.imageUri?.message}</p>
            )}

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{preset.copy.nameLabel} <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder={preset.copy.namePlaceholder} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl><Textarea placeholder={preset.copy.descriptionPlaceholder} rows={3} {...field} /></FormControl>
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

            <Collapsible open={licensingOpen} onOpenChange={setLicensingOpen}>
              <div className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border">
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between px-0 py-3 sm:px-5 sm:py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Licensing Terms</span>
                      <span className="text-xs text-muted-foreground font-normal">Optional · Berne Convention</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", licensingOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-0 pb-4 sm:px-5 sm:pb-5 space-y-4 border-t border-border/60 pt-4">
                    <FormField control={form.control} name="licenseType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>License</FormLabel>
                        <Select value={field.value} onValueChange={(value) => {
                          form.setValue("licenseType", value);
                          const def = LICENSE_TYPES.find((l) => l.value === value);
                          if (def) {
                            form.setValue("commercialUse", def.commercialUse);
                            form.setValue("derivatives", def.derivatives);
                            form.setValue("attribution", def.attribution);
                          }
                        }}>
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
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="maxSupply" render={({ field }) => (
                <FormItem>
                  <FormLabel>Supply <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl>
                  <FormDescription>Minted to your account.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="royalty" render={({ field }) => (
                <FormItem>
                  <FormLabel>Royalty % (0–50)</FormLabel>
                  <FormControl><Input type="number" min={0} max={50} step={0.5} placeholder="2.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                  <FormDescription>On secondary sales.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid from <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormDescription>You can mint and sell before it opens.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid until <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormDescription>{preset.copy.validUntilHint}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <button
              type="submit"
              disabled={busy}
              className={`w-full h-12 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] ${preset.buttonClass} ${busy ? "opacity-40 pointer-events-none" : ""}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {preset.copy.submit}
            </button>
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
