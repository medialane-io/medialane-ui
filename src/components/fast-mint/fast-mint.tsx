"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { profileHref } from "@medialane/sdk";
import { describeError } from "../../utils/describe-error.js";
import { uploadError } from "../../utils/upload-limits.js";
import { uploadFileToIpfs, type SignedUploadKind } from "../../utils/ipfs-upload.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import type { IPType } from "../../data/ip.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog.js";
import type { MetadataField } from "../ip-type-fields.js";
import { Dropzone } from "./dropzone.js";
import { SuccessView } from "./success-view.js";
import { FormatPicker, MediaRow } from "./asset-form-parts.js";
import { PartialCreateError, type StepInfo } from "./create-then-add.js";
import { FORMATS, getFormat, initialFormatStates } from "./formats/registry.js";
import type { FormatResult, FormatShared, MintFormat } from "./formats/types.js";
import { DEFAULT_VALUES, type FormValues } from "./form.js";
import { IP_TYPE_BY_KIND, MEDIA_ROUTE_MIME_TYPES, detectMediaKind } from "./media-kind.js";
import { isWebLink } from "../../utils/launchpad-rules.js";
import { useFileUpload } from "../../utils/use-file-upload.js";
import { ImageUploadField } from "../image-upload-field.js";
import { useNewCollectionDraft } from "./use-new-collection-draft.js";
import type { FastMintProps, MediaKind } from "./types.js";
import { useT } from "../../i18n/provider.js";
import { msg } from "../../i18n/translate.js";
import { ActionButton } from "../action-button.js";

const WRONG_KIND: Record<MediaKind, string> = {
  image: msg("Please upload an image."),
  video: msg("Please upload a video."),
  audio: msg("Please upload an audio file."),
  document: msg("Please upload a document."),
};

export function FastMint(props: FastMintProps) {
  const t = useT();
  const {
    presentation = "inline", open = true, onClose, mediaKindLock, onMinted,
    collections, refetchCollections,
    hasWallet, walletAddress, onRequireWallet, connectLabel, getUploadToken, getSigner,
    client,
  } = props;

  const [status, setStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState<StepInfo | null>(null);

  const [mediaKind, setMediaKind] = useState<MediaKind>("image");

  const [formatKey, setFormatKey] = useState<MintFormat>("single");
  const [formatStates, setFormatStates] = useState(initialFormatStates);
  const [resume, setResume] = useState<{ format: MintFormat; destination: unknown } | null>(null);
  const [result, setResult] = useState<FormatResult | null>(null);

  const [ipType, setIpType] = useState<IPType>("NFT");
  const templateFieldsRef = useRef<MetadataField[]>([]);

  const form = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });
  const name = form.watch("name");
  const description = form.watch("description");
  const draft = useNewCollectionDraft(name, description);

  useEffect(() => {
    if (walletAddress && !form.getValues("external_url")) {
      form.setValue("external_url", `https://medialane.io/account/${walletAddress}`);
    }
  }, [walletAddress, form]);

  const format = getFormat(formatKey);
  const formatState = formatStates[formatKey];
  const updateFormat = (patch: object) =>
    setFormatStates((states) => ({ ...states, [formatKey]: { ...(states[formatKey] as object), ...patch } }));

  const uploadFile = async (file: File, kind: SignedUploadKind) => {
    const token = await getUploadToken();
    if (!token) throw new Error(msg("Sign in first"));
    return (await uploadFileToIpfs(client.api, file, kind)).uri;
  };

  const routeFor = (file: File) => (MEDIA_ROUTE_MIME_TYPES.has(file.type) ? "media" : "document");

  const mediaProblem = (file: File) => {
    const kind = detectMediaKind(file.type);
    if (!kind) return msg("Use a supported media file.");
    if (mediaKindLock && kind !== mediaKindLock) {
      return WRONG_KIND[mediaKindLock];
    }
    return uploadError(file, routeFor(file));
  };

  const media = useFileUpload({
    validate: mediaProblem,
    upload: (file) => uploadFile(file, routeFor(file)),
    failureMessage: msg("Upload failed"),
  });
  const feature = useFileUpload({
    validate: (file) => uploadError(file, "image"),
    upload: (file) => uploadFile(file, "image"),
    failureMessage: msg("Upload failed"),
  });
  const mediaFile = media.status !== "failed" || media.canRetry ? media.file : null;

  const handleMediaSelect = (file: File) => {
    const kind = detectMediaKind(file.type);
    if (kind && !mediaProblem(file)) {
      setMediaKind(kind);
      setIpType(IP_TYPE_BY_KIND[kind]);
    }
    void media.select(file);
  };

  const image = mediaKind === "image" ? media.uri : feature.uri;
  const previewImage = mediaKind === "image" ? media.preview : feature.preview;

  const shared: FormatShared | null = media.uri && image && mediaFile
    ? {
        form, draft, collections,
        walletAddress: walletAddress ?? "",
        mediaKind, mediaUri: media.uri, mediaName: mediaFile.name, image, previewImage,
        ipType, onIpTypeChange: setIpType, templateFieldsRef,
        uploadDocument: (file) => uploadFile(file, "document"),
      }
    : null;

  const ready = !!shared && !media.uploading && !feature.uploading && name.trim().length > 0 && format.isReady(shared, formatState);

  const onSubmit = async () => {
    if (!hasWallet) { onRequireWallet(); return; }
    if (!shared || !walletAddress) return;
    const link = form.getValues("external_url");
    if (!isWebLink(link)) {
      setErrorMsg(t("Link must start with http:// or https://"));
      setStatus("error");
      return;
    }

    setStatus("minting");
    setErrorMsg(null);
    setStep(null);

    try {
      const outcome = await format.submit(shared, formatState, {
        client,
        signer: await getSigner(),
        getUploadToken,
        resume: resume?.format === formatKey ? resume.destination : null,
        onStep: setStep,
      });
      setResult(outcome);
      setResume(null);
      setStatus("success");
      invalidatePortfolioCache(walletAddress);
      if (outcome.asset) onMinted?.(outcome.asset);
      void refetchCollections().catch(() => {});
    } catch (err) {
      if (err instanceof PartialCreateError) {
        setResume({ format: formatKey, destination: err.destination });
        setErrorMsg(`${t(err.message)} ${t(describeError(err.reason).message)} ${t("Press the button again to finish.")}`);
      } else {
        setErrorMsg(t(describeError(err).message));
      }
      setStatus("error");
    }
  };

  const resetAll = () => {
    setStatus("idle");
    setErrorMsg(null);
    setStep(null);
    setResult(null);
    setResume(null);
    form.reset();
    media.clear();
    feature.clear();
    setFormatStates(initialFormatStates());
    draft.reset();
    templateFieldsRef.current = [];
  };

  const busy = status === "minting";

  const wrap = (node: React.ReactNode) => {
    if (presentation !== "dialog") return node;
    return (
      <Dialog open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
        <DialogContent className="gap-0 p-6 sm:max-w-2xl sm:p-8">
          <DialogTitle className="sr-only">{t("Create")}</DialogTitle>
          <DialogDescription className="sr-only">{t("Publish your work.")}</DialogDescription>
          {node}
        </DialogContent>
      </Dialog>
    );
  };

  if (status === "success" && result) {
    return wrap(
      <SuccessView presentation={presentation} previewImage={previewImage} result={result} onPublishAnother={resetAll} />
    );
  }

  if (!mediaFile) {
    return wrap(
      <div className="space-y-3">
        <Dropzone
          mediaKindLock={mediaKindLock}
          presentation={presentation}
          hasWallet={hasWallet}
          onRequireWallet={onRequireWallet}
          connectLabel={connectLabel}
          onFileSelected={handleMediaSelect}
        />
        {media.error && <p role="alert" className="text-center text-sm text-destructive">{media.error}</p>}
      </div>
    );
  }

  const submitBlocked = !ready || busy || !hasWallet;
  const buttonLabel = busy
    ? `${t(step?.label ?? msg("Working"))}…${step && step.total > 1 ? ` ${t("({index} of {total})", { index: step.index, total: step.total })}` : ""}`
    : t(format.submitLabel(formatState));

  return wrap(
    <section className="space-y-6">
      <MediaRow
        file={mediaFile}
        kind={mediaKind}
        preview={media.preview}
        uri={media.uri}
        uploading={media.uploading}
        ipType={ipType}
        error={media.error}
        onRetry={() => void media.retry()}
        onSelect={handleMediaSelect}
      />

      {media.uri && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-5">
            <FormatPicker formats={FORMATS} value={formatKey} onChange={setFormatKey} />

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Name")}</label>
              <Input
                value={name}
                onChange={(e) => form.setValue("name", e.target.value)}
                placeholder={t("The title of this digital asset")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Description")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></label>
              <Textarea
                value={description}
                onChange={(e) => form.setValue("description", e.target.value)}
                placeholder={t("Tell the story behind this work")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Link")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></label>
              <Input
                value={form.watch("external_url")}
                onChange={(e) => form.setValue("external_url", e.target.value)}
                placeholder={t("https://yourwebsite.com")}
              />
            </div>

            {mediaKind !== "image" && (
              <ImageUploadField
                upload={feature}
                label={t("Cover image")}
              />
            )}

            {shared && <format.Fields shared={shared} state={formatState} update={updateFormat} />}

            {status === "error" && errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

            <ActionButton solid big type="button" disabled={submitBlocked} onClick={() => void onSubmit()} className="w-full">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {buttonLabel}
            </ActionButton>
          </div>

          <div className="order-first lg:order-last lg:sticky lg:top-20 max-w-[260px] mx-auto w-full lg:max-w-none lg:mx-0">
            <MedialaneCollectionCard
              image={previewImage}
              name={name}
              collection={shared ? format.previewLabel(shared, formatState, t) : undefined}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
            />
          </div>
        </div>
      )}
    </section>
  );
}
