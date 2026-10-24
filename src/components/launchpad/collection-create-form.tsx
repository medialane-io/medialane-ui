"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  FIELD_LIMITS,
  acceptFor,
  buildCollectionMetadata,
  collectionHref,
  getCoordinates,
  profileHref,
} from "@medialane/sdk";
import { createdCollectionFromReceipt, deployedCollectionFromReceipt } from "@medialane/sdk/starknet";
import Image from "../image.js";
import { Button } from "../button.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { CreationSuccess } from "../creation-success.js";
import { ExternalLinkField } from "../external-link-field.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { uploadJsonToIpfs } from "../../utils/ipfs-upload.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useLaunchpadImageUpload } from "../../utils/use-launchpad-image-upload.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import { suggestLaunchpadSymbol } from "../../utils/launchpad-defaults.js";
import type { CollectionCreatePreset } from "./collection-create-presets.js";

const schema = z.object({
  name: z.string().min(1, "Name required").max(FIELD_LIMITS.name),
  symbol: z
    .string()
    .min(1, "Symbol required")
    .max(FIELD_LIMITS.symbol, `Max ${FIELD_LIMITS.symbol} characters`)
    .regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only"),
  description: z.string().max(FIELD_LIMITS.description).optional(),
  external_link: z
    .string()
    .max(500)
    .refine((v) => !v || v.startsWith("http://") || v.startsWith("https://"), {
      message: "Must start with http:// or https://",
    })
    .optional(),
});
type FormValues = z.infer<typeof schema>;

export interface CollectionCreateFormProps {
  preset: CollectionCreatePreset;
  aside?: ReactNode;
}

export function CollectionCreateForm({ preset, aside }: CollectionCreateFormProps) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const upload = useLaunchpadImageUpload({ successMessage: "Image uploaded" });
  const { imageFile, imagePreview, imageUri, imageUploading, uploadError, fileInputRef, handleImageSelect, clearImage } = upload;
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
    const api = app.getClient().api;
    if (deployedAddress) {
      setViewHref(collectionHref("STARKNET", deployedAddress));
      if (preset.registerAfterDeploy) void api.collections.register(deployedAddress).catch(() => {});
    } else if (createdId && walletAddress) {
      api.collections
        .list({ owner: walletAddress, limit: 50 })
        .then((res) => {
          const created = (res.data ?? []).find((c) => c.collectionId === createdId);
          if (alive && created) setViewHref(collectionHref("STARKNET", created.contractAddress));
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [tx.phase, deployedAddress, createdId, walletAddress, app, preset.registerAfterDeploy]);

  const handleAgain = () => {
    tx.reset();
    setViewHref(null);
    setAutoSymbol("");
    form.reset();
    clearImage();
  };

  const onSubmit = (values: FormValues) => {
    if (imageFile && !imageUri && !imageUploading) return;
    if (!walletAddress) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const baseUri = await uploadJsonToIpfs(
        api,
        buildCollectionMetadata({
          name: values.name,
          description: values.description,
          image: imageUri,
          externalLink: values.external_link,
          owner: walletAddress,
        }),
      );
      await runIntentCalls(signer, () =>
        api.intents.create("create-collection", {
          owner: walletAddress,
          name: values.name,
          symbol: values.symbol,
          baseUri,
          ...(preset.service ? { service: preset.service } : {}),
        }),
      );
      invalidatePortfolioCache(walletAddress);
    });
  };

  const { copy } = preset;
  const busy = tx.phase !== "idle" || imageUploading;
  const actions = preset.actions({ address: deployedAddress, collectionHref: viewHref });

  return (
    <WalletRequired icon={Icon} iconClassName={preset.iconClass} title={preset.signedOut.title} description={preset.signedOut.description}>
      <TransactionDialog tx={tx} title={preset.dialog.title} workingLabel={preset.dialog.workingLabel} firstStepLabel={preset.dialog.firstStepLabel}>
        <CreationSuccess
          name={name || preset.success.fallbackName}
          image={imagePreview}
          caption={preset.success.caption}
          primary={actions.primary}
          secondary={actions.secondary}
          onAgain={handleAgain}
          againLabel={preset.success.againLabel}
        >
          <RewardEarned actionType={preset.success.reward} />
        </CreationSuccess>
      </TransactionDialog>

      <ClaimRouteShell
        icon={<Icon className="h-4 w-4 text-white" />}
        title={preset.shell.title}
        subtitle={preset.shell.subtitle}
        aside={
          <>
            <MedialaneCollectionCard
              image={imagePreview}
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
            <div className="space-y-2">
              <p className="text-sm font-medium">{copy.imageHeading}</p>
              <div className="flex items-start gap-4">
                <div
                  className="relative h-28 w-28 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label={`Upload ${copy.imageHeading.toLowerCase()}`}
                  onClick={() => !imageUploading && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!imageUploading) fileInputRef.current?.click();
                    }
                  }}
                >
                  {imagePreview ? (
                    <Image src={imagePreview} alt={copy.imageHeading} fill unoptimized className="object-cover" />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  )}
                  {imageUploading && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptFor("image")}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleImageSelect(f);
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" disabled={imageUploading} onClick={() => fileInputRef.current?.click()}>
                    {imageUploading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Uploading…
                      </>
                    ) : imageFile ? (
                      "Change image"
                    ) : (
                      "Upload image"
                    )}
                  </Button>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF, SVG or WebP
                    {imageUri && <span className="ml-2 text-emerald-500 font-medium">✓ Uploaded</span>}
                  </p>
                  {copy.imageHelp && <p className="text-xs text-muted-foreground">{copy.imageHelp}</p>}
                  {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
                </div>
              </div>
            </div>

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
                <FormLabel>Symbol *</FormLabel>
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
                <FormLabel>Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl><Textarea placeholder={copy.descriptionPlaceholder} rows={3} {...field} /></FormControl>
                {copy.descriptionHint && <FormDescription>{copy.descriptionHint}</FormDescription>}
                <FormMessage />
              </FormItem>
            )} />

            <ExternalLinkField form={form} address={walletAddress} />

            <button
              type="submit"
              disabled={busy}
              className={`w-full h-12 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] ${preset.buttonClass} ${busy ? "opacity-40 pointer-events-none" : ""}`}
            >
              <Icon className="h-4 w-4" />
              {copy.submit}
            </button>
            {copy.footnotes.map((note) => (
              <p key={note} className="text-xs text-center text-muted-foreground">{note}</p>
            ))}
          </form>
        </Form>
      </ClaimRouteShell>
    </WalletRequired>
  );
}
