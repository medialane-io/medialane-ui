"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { profileHref } from "@medialane/sdk";
import { describeError } from "../../utils/describe-error.js";
import { uploadError } from "../../utils/upload-limits.js";
import { uploadFileToIpfs, type SignedUploadKind } from "../../utils/ipfs-upload.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import { cn } from "../../utils/cn.js";
import type { IPType } from "../../data/ip.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog.js";
import type { MetadataField } from "../ip-type-fields.js";
import { Dropzone } from "./dropzone.js";
import { SuccessView } from "./success-view.js";
import { CoverUpload, FormatPicker, MediaRow } from "./asset-form-parts.js";
import { PartialCreateError, type StepInfo } from "./create-then-add.js";
import { FORMATS, getFormat, initialFormatStates } from "./formats/registry.js";
import type { FormatResult, FormatShared, MintFormat } from "./formats/types.js";
import { DEFAULT_VALUES, type FormValues } from "./form.js";
import { IP_TYPE_BY_KIND, MEDIA_ROUTE_MIME_TYPES, detectMediaKind } from "./media-kind.js";
import { isWebLink } from "../../utils/launchpad-rules.js";
import { useIpfsUpload } from "./use-ipfs-upload.js";
import { useNewCollectionDraft } from "./use-new-collection-draft.js";
import type { FastMintProps, MediaKind } from "./types.js";
import { useT } from "../../i18n/provider.js";

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

  const media = useIpfsUpload();
  const feature = useIpfsUpload();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

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
    if (!token) throw new Error("Sign in first");
    return (await uploadFileToIpfs(client.api, file, kind)).uri;
  };

  const handleMediaSelect = async (file: File) => {
    const kind = detectMediaKind(file.type);
    if (!kind) {
      setErrorMsg("Publish an image, audio, video (JPG/PNG/GIF/SVG/WebP, MP3/WAV/OGG/FLAC, MP4/WebM), or document (PDF, DOC, DOCX, ODT, RTF, TXT, MD).");
      return;
    }
    if (mediaKindLock && kind !== mediaKindLock) {
      setErrorMsg(`Please upload a${mediaKindLock === "image" ? "n" : ""} ${mediaKindLock}.`);
      return;
    }
    const route = MEDIA_ROUTE_MIME_TYPES.has(file.type) ? "media" : "document";
    const fileError = uploadError(file, route);
    if (fileError) {
      setErrorMsg(fileError);
      return;
    }
    setMediaFile(file);
    setMediaKind(kind);
    setIpType(IP_TYPE_BY_KIND[kind]);
    await media.start(file, (f) => uploadFile(f, route), setErrorMsg);
  };

  const clearMedia = () => {
    setMediaFile(null);
    media.clear();
    if (mediaInputRef.current) mediaInputRef.current.value = "";
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
      setErrorMsg("External link must start with http:// or https://");
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
        setErrorMsg(`${err.message} ${describeError(err.reason).message} Press the button again to finish.`);
      } else {
        setErrorMsg(describeError(err).message);
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
    clearMedia();
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
          <DialogDescription className="sr-only">{t("Add media, describe it and publish it as an asset.")}</DialogDescription>
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
      <Dropzone
        mediaKindLock={mediaKindLock}
        presentation={presentation}
        hasWallet={hasWallet}
        onRequireWallet={onRequireWallet}
        connectLabel={connectLabel}
        onFileSelected={handleMediaSelect}
      />
    );
  }

  const submitBlocked = !ready || busy || !hasWallet;
  const buttonLabel = busy
    ? `${step?.label ?? "Working"}…${step && step.total > 1 ? ` (${step.index} of ${step.total})` : ""}`
    : format.submitLabel(formatState);

  return wrap(
    <section className="space-y-6">
      <MediaRow
        file={mediaFile}
        kind={mediaKind}
        preview={media.preview}
        uri={media.uri}
        uploading={media.uploading}
        ipType={ipType}
        inputRef={mediaInputRef}
        onSelect={handleMediaSelect}
      />

      {media.uri && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-5">
            <FormatPicker formats={FORMATS} value={formatKey} onChange={setFormatKey} />

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Title *")}</label>
              <Input
                value={name}
                onChange={(e) => form.setValue("name", e.target.value)}
                placeholder={t("My Creative Work")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Description")}</label>
              <Textarea
                value={description}
                onChange={(e) => form.setValue("description", e.target.value)}
                placeholder={t("Describe your work, its story, and any context for buyers…")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("External link")} <span className="text-muted-foreground font-normal">{t("(optional)")}</span></label>
              <Input
                value={form.watch("external_url")}
                onChange={(e) => form.setValue("external_url", e.target.value)}
                placeholder={t("https://yourwebsite.com")}
              />
            </div>

            {mediaKind !== "image" && (
              <CoverUpload
                preview={feature.preview}
                uploading={feature.uploading}
                inputRef={featureInputRef}
                onSelect={(file) => void feature.start(file, (f) => uploadFile(f, "image"), setErrorMsg)}
              />
            )}

            {shared && <format.Fields shared={shared} state={formatState} update={updateFormat} />}

            {status === "error" && errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

            <button
              type="button"
              disabled={submitBlocked}
              onClick={() => void onSubmit()}
              className={cn(
                "w-full h-12 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] bg-brand-blue",
                submitBlocked && "opacity-40 pointer-events-none"
              )}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {buttonLabel}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              {t("Zero platform fees to mint.")}
            </p>
          </div>

          <div className="order-first lg:order-last lg:sticky lg:top-20 max-w-[260px] mx-auto w-full lg:max-w-none lg:mx-0">
            <MedialaneCollectionCard
              image={previewImage}
              name={name}
              collection={shared ? format.previewLabel(shared, formatState) : undefined}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
            />
          </div>
        </div>
      )}
    </section>
  );
}
