"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { buildCollectionMetadata, collectionHref, getCoordinates, profileHref } from "@medialane/sdk";
import { ImageUploadField } from "../image-upload-field.js";
import { FIELD_LIMITS } from "../../utils/field-limits.js";
import { createdCollectionAddress, createdCollectionFromReceipt, deployedCollectionFromReceipt } from "@medialane/sdk/starknet";
import { ActionButton } from "../action-button.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
import { ExternalLinkField } from "../external-link-field.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { serviceCollectionIntent } from "../../utils/launchpad-actions.js";
import { uploadJsonToIpfs } from "../../utils/ipfs-upload.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useImageUpload } from "../../utils/use-image-upload.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import { suggestLaunchpadSymbol } from "../../utils/launchpad-defaults.js";
import { symbolField, webLinkField } from "../../utils/launchpad-rules.js";
import type { CollectionCreatePreset } from "./collection-create-presets.js";
import { useT } from "../../i18n/provider.js";

const schema = z.object({
  name: z.string().min(1, "Name required").max(FIELD_LIMITS.name),
  symbol: symbolField(),
  description: z.string().max(FIELD_LIMITS.description).optional(),
  external_link: webLinkField(),
});
type FormValues = z.infer<typeof schema>;

export interface CollectionCreateFormProps {
  preset: CollectionCreatePreset;
  aside?: ReactNode;
}

export function CollectionCreateForm({ preset, aside }: CollectionCreateFormProps) {
  const t = useT();
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const upload = useImageUpload();
  const [autoSymbol, setAutoSymbol] = useState("");
  const [viewHref, setViewHref] = useState<string | null>(null);
  const Icon = preset.icon;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", symbol: "", description: "", external_link: "" },
  });
  const name = form.watch("name");

  useEffect(() => {
    if (!preset.suggestSymbol) return;
    const suggested = suggestLaunchpadSymbol(name);
    if (!suggested) return;
    const current = form.getValues("symbol");
    if (!current || current === autoSymbol) {
      form.setValue("symbol", suggested, { shouldDirty: false });
      setAutoSymbol(suggested);
    }
  }, [autoSymbol, name, form, preset.suggestSymbol]);

  const deployedAddress =
    tx.receipt && preset.service ? deployedCollectionFromReceipt(tx.receipt, preset.service) : null;
  const createdId =
    tx.receipt && !preset.service ? createdCollectionFromReceipt(tx.receipt, getCoordinates("STARKNET").collection721)?.collectionId ?? null : null;

  useEffect(() => {
    if (tx.phase !== "success") return;
    let alive = true;
    const client = app.getClient();
    if (deployedAddress) {
      setViewHref(collectionHref("STARKNET", deployedAddress));
      if (preset.registerAfterDeploy) void client.api.collections.register(deployedAddress).catch(() => {});
    } else if (createdId) {
      createdCollectionAddress(client.provider, getCoordinates("STARKNET").collection721, createdId)
        .then((address) => {
          if (alive && address) setViewHref(collectionHref("STARKNET", address));
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [tx.phase, deployedAddress, createdId, app, preset.registerAfterDeploy]);

  const handleAgain = () => {
    tx.reset();
    setViewHref(null);
    setAutoSymbol("");
    form.reset();
    upload.clear();
  };

  const onSubmit = (values: FormValues) => {
    if (!upload.confirm()) return;
    if (!walletAddress) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const baseUri = await uploadJsonToIpfs(
        api,
        buildCollectionMetadata({
          name: values.name,
          description: values.description,
          image: upload.uri,
          externalLink: values.external_link,
          owner: walletAddress,
        }),
      );
      await runIntentCalls(signer, () =>
        serviceCollectionIntent(api, {
          owner: walletAddress,
          name: values.name,
          symbol: values.symbol,
          baseUri,
          service: preset.service ?? undefined,
        }),
      );
      invalidatePortfolioCache(walletAddress);
    });
  };

  const { copy } = preset;
  const busy = tx.phase !== "idle" || upload.uploading;
  const actions = preset.actions({ address: deployedAddress, collectionHref: viewHref });

  return (
    <WalletRequired icon={Icon} iconClassName={preset.iconClass} title={t(preset.signedOut.title)} description={t(preset.signedOut.description)}>
      <TransactionDialog tx={tx} title={t(preset.dialog.title)} workingLabel={t(preset.dialog.workingLabel)} firstStepLabel={t(preset.dialog.firstStepLabel)}>
        <TransactionSuccess
          name={name || t(preset.success.fallbackName)}
          image={upload.preview}
          title={t(preset.success.title)}
          description={t(preset.success.description)}
          actions={[actions.primary, actions.secondary, { label: t(preset.success.againLabel), onClick: handleAgain }]}
        >
          <RewardEarned actionType={t(preset.success.reward)} />
        </TransactionSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<Icon className="h-4 w-4 text-white" />}
        title={t(preset.shell.title)}
        subtitle={t(preset.shell.subtitle)}
        aside={
          <>
            <MedialaneCollectionCard
              image={upload.preview}
              name={name}
              collection={form.watch("symbol") || preset.cardFallbackSymbol}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
            />
            {aside}
          </>
        }
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <ImageUploadField
              upload={upload}
              label={t(copy.imageHeading)}
              alt={t(copy.imageHeading)}
              hint={copy.imageHelp ? t(copy.imageHelp) : undefined}
            />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{copy.nameLabel}</FormLabel>
                <FormControl><Input placeholder={copy.namePlaceholder} {...field} /></FormControl>
                <FormDescription>{copy.nameHint}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="symbol" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Symbol *")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={copy.symbolPlaceholder}
                    maxLength={FIELD_LIMITS.symbol}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>{copy.symbolHint}</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Description")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></FormLabel>
                <FormControl><Textarea placeholder={copy.descriptionPlaceholder} rows={3} {...field} /></FormControl>
                {copy.descriptionHint && <FormDescription>{copy.descriptionHint}</FormDescription>}
                <FormMessage />
              </FormItem>
            )} />

            <ExternalLinkField form={form} address={walletAddress} />

            <ActionButton solid big type="submit" disabled={busy} icon={<Icon className="h-4 w-4" />} className="w-full">              {copy.submit}            </ActionButton>
            {copy.footnotes.map((note) => (
              <p key={note} className="text-xs text-center text-muted-foreground">{note}</p>
            ))}
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
