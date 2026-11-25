"use client";

import { PageContainer } from "../page-container.js";
import { PageState } from "../page-state.js";
import { PageHeaderSkeleton } from "../page-header.js";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ChevronDown, ShieldCheck } from "lucide-react";
import { collectionHref, normalizeAddress, profileHref } from "@medialane/sdk";
import { FIELD_LIMITS } from "../../utils/field-limits.js";
import Link from "../link.js";
import { Button } from "../button.js";
import { ActionButton } from "../action-button.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Skeleton } from "../skeleton.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { ToggleGroup } from "../create-form-primitives.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, LICENSE_TYPES } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";
import { runIntentsCalls } from "../../utils/run-intent-calls.js";
import { dateToUnixTimestamp, tierIntents, tierTraits } from "../../utils/launchpad-actions.js";
import { positiveIntegerField, webLinkField } from "../../utils/launchpad-rules.js";
import { pinAssetMetadata } from "../../utils/ipfs-upload.js";
import { useCollection } from "../../utils/use-collections.js";
import { useCollectionProfile } from "../../utils/use-profiles.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useImageUpload } from "../../utils/use-image-upload.js";
import { ImageUploadField } from "../image-upload-field.js";
import type { TierMintPreset } from "./tier-mint-presets.js";
import { useT } from "../../i18n/provider.js";

function makeSchema(preset: TierMintPreset) {
  return z.object({
    name: z.string().min(1, preset.copy.nameRequired).max(FIELD_LIMITS.name),
    description: z.string().max(FIELD_LIMITS.description).optional(),
    external_url: webLinkField(),
    maxSupply: positiveIntegerField("Supply required"),
    royalty: z.coerce.number().min(0).max(50).default(2.5),
    licenseType: z.string().min(1),
    commercialUse: z.enum(["Yes", "No"]),
    derivatives: z.enum(["Allowed", "Not Allowed", "Share-Alike"]),
    attribution: z.enum(["Required", "Not Required"]),
    geographicScope: z.string(),
    aiPolicy: z.enum(["Allowed", "Not Allowed", "Training Only"]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });
}
type FormValues = z.infer<ReturnType<typeof makeSchema>>;

export interface TierMintFormProps {
  contract: string;
  preset: TierMintPreset;
  aside?: ReactNode;
}

export function TierMintForm({ contract: rawContract, preset, aside }: TierMintFormProps) {
  const t = useT();
  const app = useMedialaneApp();
  const address = app.walletAddress;
  const contract = normalizeAddress("STARKNET", rawContract);
  const { collection, isLoading } = useCollection(contract);
  const { profile, isLoading: profileLoading } = useCollectionProfile(preset.suggestExternalLink ? contract : undefined);
  const tx = useTransaction();
  const upload = useImageUpload();
  const [licensingOpen, setLicensingOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const Icon = preset.icon;

  const form = useForm<FormValues>({
    resolver: zodResolver(makeSchema(preset)),
    defaultValues: {
      name: "", description: "", external_url: "",
      maxSupply: "100", royalty: 2.5, licenseType: "CC BY-SA", commercialUse: "Yes",
      derivatives: "Share-Alike", attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Allowed",
    },
  });

  useEffect(() => {
    if (!preset.suggestExternalLink || profileLoading) return;
    const suggested = profile?.slug ? `https://medialane.io/collection/${profile.slug}` : `https://medialane.io${collectionHref("STARKNET", contract)}`;
    if (!form.getValues("external_url")) form.setValue("external_url", suggested);
  }, [contract, profileLoading, profile?.slug, form, preset.suggestExternalLink]);

  const isOwner = !!address && !!collection?.owner && normalizeAddress("STARKNET", address) === normalizeAddress("STARKNET", collection.owner);

  const handleAgain = () => {
    tx.reset();
    form.reset({ ...form.getValues(), name: "", description: "", maxSupply: "100" });
    upload.clear();
  };

  const onSubmit = (values: FormValues) => {
    if (!upload.confirm(preset.copy.imageRequired)) return;
    if (!address) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const pinned = await pinAssetMetadata(api, {
        name: values.name,
        description: values.description ?? "",
        imageUri: upload.uri!,
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
        templateTraits: tierTraits(preset.traitType, values.maxSupply, contract),
      });
      const intents = await tierIntents(api, {
        owner: address,
        contract,
        service: preset.service,
        tierId: await preset.predictNextId(api, contract),
        maxSupply: values.maxSupply,
        startTime: dateToUnixTimestamp(values.startDate),
        endTime: dateToUnixTimestamp(values.endDate),
        royaltyBps: Math.round(values.royalty * 100),
        metadataUri: pinned.uri,
      });
      await runIntentsCalls(signer, intents);
    });
  };

  const gateProps = { icon: Icon, iconClassName: preset.iconClass, title: t(preset.signedOut.title), description: t(preset.signedOut.description) };
  const busy = tx.phase !== "idle" || upload.uploading;

  if (isLoading) {
    return (
      <WalletRequired {...gateProps}>
        <PageContainer variant="narrow" className="space-y-8">
          <PageHeaderSkeleton />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </PageContainer>
      </WalletRequired>
    );
  }

  if (!collection) {
    return (
      <WalletRequired {...gateProps}>
        <PageState icon={AlertCircle} description={t("Collection not found.")}>
          <Button asChild variant="soft" size="sm"><Link href={preset.back.href}>{t(preset.back.label)}</Link></Button>
        </PageState>
      </WalletRequired>
    );
  }

  if (!isOwner) {
    return (
      <WalletRequired {...gateProps}>
        <PageState icon={Icon} description={t(preset.notOwner.message)}>
          <Button asChild variant="soft" size="sm"><Link href={preset.notOwner.back.href}>{t(preset.notOwner.back.label)}</Link></Button>
        </PageState>
      </WalletRequired>
    );
  }

  return (
    <WalletRequired {...gateProps}>
      <TransactionDialog tx={tx} title={t(preset.dialog.title)} workingLabel={t(preset.dialog.workingLabel)} firstStepLabel={t(preset.dialog.firstStepLabel)}>
        <TransactionSuccess
          name={form.getValues("name")}
          image={upload.preview}
          title={t(preset.success.title)}
          description={t(preset.success.description)}
          actions={[{ href: collectionHref("STARKNET", contract), label: t("View collection") }, { label: t(preset.success.againLabel), onClick: handleAgain }]}
        >
          <RewardEarned actionType="launch_launchpad" />
        </TransactionSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<Icon className="h-4 w-4 text-white" />}
        title={t(preset.shell.title)}
        subtitle={preset.shell.subtitle(collection.name ?? null, t)}
        aside={
          <>
            <MedialaneCollectionCard
              image={upload.preview}
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
          <form onSubmit={form.handleSubmit(onSubmit, () => { upload.confirm(preset.copy.imageRequired); })} className="space-y-5">
            <ImageUploadField upload={upload} label={t(preset.copy.imageHeading)} alt={t(preset.copy.imageAlt)} required />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t(preset.copy.nameLabel)} <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder={t(preset.copy.namePlaceholder)} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Description")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                <FormControl><Textarea placeholder={t(preset.copy.descriptionPlaceholder)} rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="external_url" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("External link")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                <FormControl><Input placeholder={t("https://yourwebsite.com")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Collapsible open={licensingOpen} onOpenChange={setLicensingOpen}>
              <div className="sm:overflow-hidden sm:rounded-xl sm:border sm:border-border">
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between px-0 py-3 sm:px-5 sm:py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{t("License terms")}</span>
                      <span className="text-xs text-muted-foreground font-normal">{t("Optional · Berne Convention")}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", licensingOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-0 pb-4 sm:px-5 sm:pb-5 space-y-4 border-t border-border/60 pt-4">
                    <FormField control={form.control} name="licenseType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("License")}</FormLabel>
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
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="maxSupply" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Supply")} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="number" min="1" placeholder="100" {...field} /></FormControl>
                  <FormDescription>{t("Minted to your account.")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="royalty" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Royalty % (0–50)")}</FormLabel>
                  <FormControl><Input type="number" min={0} max={50} step={0.5} placeholder="2.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                  <FormDescription>{t("On secondary sales.")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Valid from")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormDescription>{t("You can mint and sell before it opens.")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Valid until")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                  <FormControl><Input type="datetime-local" {...field} /></FormControl>
                  <FormDescription>{t(preset.copy.validUntilHint)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <ActionButton solid big type="submit" disabled={busy} icon={<Icon className="h-4 w-4" />} className="w-full">              {t(preset.copy.submit)}            </ActionButton>
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
