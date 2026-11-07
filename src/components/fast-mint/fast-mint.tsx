"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { profileHref } from "@medialane/sdk";
import { describeError } from "../../utils/describe-error.js";
import { uploadError } from "../../utils/upload-limits.js";
import { uploadFileToIpfs, type SignedUploadKind } from "../../utils/ipfs-upload.js";
import { cn } from "../../utils/cn.js";
import type { IPType } from "../../data/ip.js";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../dialog.js";
import type { MetadataField } from "../ip-type-fields.js";
import { Dropzone } from "./dropzone.js";
import { SuccessView } from "./success-view.js";
import { AssetTypePicker, CoverUpload, MediaRow } from "./asset-form-parts.js";
import { CollectionSection, type CollectionMode } from "./collection-section.js";
import { LicensingSection } from "./licensing-section.js";
import { IpTypeSection } from "./ip-type-section.js";
import { DEFAULT_VALUES, type FormValues } from "./form.js";
import { IP_TYPE_BY_KIND, MEDIA_ROUTE_MIME_TYPES, detectMediaKind } from "./media-kind.js";
import { mintAsset } from "./mint-asset.js";
import { mintableCollections, type MintAssetType } from "./mintable-collections.js";
import { useIpfsUpload } from "./use-ipfs-upload.js";
import { useNewCollectionDraft } from "./use-new-collection-draft.js";
import type { FastMintProps, MediaKind, MintedAsset } from "./types.js";

export function FastMint(props: FastMintProps) {
  const {
    presentation = "inline", open = true, onClose, mediaKindLock, onMinted,
    collections, refetchCollections,
    hasWallet, walletAddress, onRequireWallet, connectLabel, getUploadToken, getSigner,
    client, successFooter,
  } = props;

  const [status, setStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const media = useIpfsUpload();
  const feature = useIpfsUpload();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  const [assetType, setAssetType] = useState<MintAssetType>("single");
  const [editionCount, setEditionCount] = useState("10");

  const [collectionMode, setCollectionMode] = useState<CollectionMode>("existing");
  const [existingCollectionId, setExistingCollectionId] = useState("");
  const [existingCollectionContract, setExistingCollectionContract] = useState("");

  const [ipType, setIpType] = useState<IPType>("NFT");
  const templateFieldsRef = useRef<MetadataField[]>([]);

  const [mintedAsset, setMintedAsset] = useState<MintedAsset | null>(null);

  const form = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });
  const name = form.watch("name");
  const description = form.watch("description");
  const draft = useNewCollectionDraft(name, description);

  useEffect(() => {
    if (walletAddress && !form.getValues("external_url")) {
      form.setValue("external_url", `https://medialane.io/account/${walletAddress}`);
    }
  }, [walletAddress, form]);

  const erc721Collections = mintableCollections("single", collections);
  const erc1155Collections = mintableCollections("editions", collections);

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

  const ready = !!media.uri && !media.uploading && name.trim().length > 0 &&
    (mediaKind === "image" || !!feature.uri) &&
    (collectionMode === "existing"
      ? assetType === "single" ? !!existingCollectionId : !!existingCollectionContract
      : draft.name.trim().length > 0 && draft.symbol.trim().length > 0);

  const onSubmit = async (values: FormValues) => {
    if (!hasWallet) { onRequireWallet(); return; }
    if (!walletAddress || !media.uri) return;
    if (values.external_url && !values.external_url.startsWith("http://") && !values.external_url.startsWith("https://")) {
      setErrorMsg("External link must start with http:// or https://");
      return;
    }

    setStatus("minting");
    setErrorMsg(null);

    try {
      const asset = await mintAsset({
        client,
        signer: await getSigner(),
        walletAddress,
        values,
        ipType,
        templateFields: templateFieldsRef.current,
        mediaKind,
        mediaUri: media.uri,
        featureUri: feature.uri,
        assetType,
        editionCount,
        destination: collectionMode === "new"
          ? { mode: "new", name: draft.name, symbol: draft.symbol, description: draft.description }
          : { mode: "existing", collectionId: existingCollectionId, collectionContract: existingCollectionContract },
        singleCollections: erc721Collections,
        refetchCollections,
        getUploadToken,
      });
      if (asset) {
        setMintedAsset(asset);
        onMinted?.(asset);
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(describeError(err).message);
      setStatus("error");
    }
  };

  const resetAll = () => {
    setStatus("idle");
    setErrorMsg(null);
    setMintedAsset(null);
    form.reset();
    clearMedia();
    feature.clear();
    setAssetType("single");
    setEditionCount("10");
    setCollectionMode("existing");
    setExistingCollectionId("");
    setExistingCollectionContract("");
    draft.reset();
    templateFieldsRef.current = [];
  };

  const busy = status === "minting";
  const previewImage = mediaKind === "image" ? media.preview : feature.preview;
  const selectedExistingCollection = assetType === "single"
    ? erc721Collections.find((c) => c.collectionId === existingCollectionId)
    : erc1155Collections.find((c) => c.contractAddress === existingCollectionContract);
  const collectionLabel = media.uri
    ? (collectionMode === "new"
      ? (draft.name || "New collection")
      : (selectedExistingCollection?.name || "IP Asset"))
    : undefined;

  const wrap = (node: React.ReactNode) => {
    if (presentation !== "dialog") return node;
    return (
      <Dialog open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
        <DialogContent className="gap-0 p-6 sm:max-w-2xl sm:p-8">
          <DialogTitle className="sr-only">Create</DialogTitle>
          <DialogDescription className="sr-only">Add media, describe it and publish it as an asset.</DialogDescription>
          {node}
        </DialogContent>
      </Dialog>
    );
  };

  if (status === "success") {
    return wrap(
      <SuccessView
        footer={successFooter}
        presentation={presentation}
        previewImage={previewImage}
        name={name}
        collectionLabel={collectionLabel}
        mintedAsset={mintedAsset}
        onPublishAnother={resetAll}
      />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={name}
                onChange={(e) => form.setValue("name", e.target.value)}
                placeholder="My Creative Work"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => form.setValue("description", e.target.value)}
                placeholder="Describe your work, its story, and any context for buyers…"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">External link <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                value={form.watch("external_url")}
                onChange={(e) => form.setValue("external_url", e.target.value)}
                placeholder="https://yourwebsite.com"
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

            <AssetTypePicker
              value={assetType}
              onChange={setAssetType}
              editionCount={editionCount}
              onEditionCount={setEditionCount}
            />

            <CollectionSection
              assetType={assetType}
              mode={collectionMode}
              onModeChange={setCollectionMode}
              collections={assetType === "single" ? erc721Collections : erc1155Collections}
              existingId={existingCollectionId}
              existingContract={existingCollectionContract}
              onExistingId={setExistingCollectionId}
              onExistingContract={setExistingCollectionContract}
              draft={draft}
              previewImage={previewImage}
            />

            <LicensingSection form={form} />

            <IpTypeSection
              ipType={ipType}
              onIpTypeChange={setIpType}
              fieldsRef={templateFieldsRef}
              uploadDocument={(file) => uploadFile(file, "document")}
              existingDocument={mediaKind === "document" ? { uri: media.uri, name: mediaFile.name } : null}
            />

            {status === "error" && errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

            <button
              type="button"
              disabled={submitBlocked}
              onClick={form.handleSubmit(onSubmit)}
              className={cn(
                "w-full h-12 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] bg-brand-blue",
                submitBlocked && "opacity-40 pointer-events-none"
              )}
            >
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Minting…</> : assetType === "single" ? "Mint NFT" : "Mint Editions"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Zero platform fees to mint.
            </p>
          </div>

          <div className="order-first lg:order-last lg:sticky lg:top-20 max-w-[260px] mx-auto w-full lg:max-w-none lg:mx-0">
            <MedialaneCollectionCard
              image={previewImage}
              name={name}
              collection={collectionLabel}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
            />
          </div>
        </div>
      )}
    </section>
  );
}
