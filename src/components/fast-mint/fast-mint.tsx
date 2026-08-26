"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { hash } from "starknet";
import { normalizeAddress, getService, buildAssetMetadata, type ApiCollection } from "@medialane/sdk";
import { executeIntent } from "@medialane/sdk/starknet";
import {
  ImagePlus, Music, Video, FileText, Loader2,
  Layers, ImagePlus as SingleIcon, ChevronDown, Boxes, Plus, Check,
  ShieldCheck, X,
} from "lucide-react";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { ActionDialog } from "../action-dialog.js";
import { IPTypeFields, type MetadataField } from "../ip-type-fields.js";
import {
  IP_TYPES, LICENSE_TYPES, GEOGRAPHIC_SCOPES, AI_POLICIES, DERIVATIVES_OPTIONS,
  type IPType,
} from "../../data/ip.js";
import { IP_TEMPLATES } from "../../data/ip-templates.js";
import { suggestLaunchpadSymbol } from "../../utils/launchpad-defaults.js";
import { uploadFileToIpfs, uploadJsonToIpfs, uploadFailureToast } from "../../utils/ipfs-upload.js";
import { ipfsToHttp } from "../../utils/ipfs.js";
import { cn } from "../../utils/cn.js";
import { Dropzone } from "./dropzone.js";
import { SuccessView } from "./success-view.js";
import type { FastMintProps, FastMintSigner, MediaKind, MintedAsset } from "./types.js";

const COLLECTION_DEPLOYED_SELECTOR = hash.getSelectorFromName("CollectionDeployed");
const IP_MINTED_SELECTOR = hash.getSelectorFromName("IPMinted");

async function readMintedTokenId(
  provider: { getTransactionReceipt(txHash: string): Promise<unknown> },
  txHash: string,
  contractAddress: string,
): Promise<string | null> {
  let receipt: { events?: { from_address?: string; keys?: string[] }[] } | null = null;
  for (let attempt = 0; attempt < 3 && !receipt; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
      const raw = await provider.getTransactionReceipt(txHash);
      receipt = raw as { events?: { from_address?: string; keys?: string[] }[] };
    } catch { /* retry */ }
  }
  const events = receipt?.events ?? [];
  const mintEvent = events.find((e) =>
    e.from_address && BigInt(e.from_address) === BigInt(contractAddress) &&
    e.keys?.[0] && BigInt(e.keys[0]) === BigInt(IP_MINTED_SELECTOR)
  );
  if (!mintEvent?.keys?.[1]) return null;
  const low = BigInt(mintEvent.keys[1] ?? 0);
  const high = BigInt(mintEvent.keys[2] ?? 0);
  return (low + (high << 128n)).toString();
}

const MEDIA_ROUTE_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif",
  "video/mp4", "video/webm", "video/ogg",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/flac",
  "application/pdf",
]);
const DOCUMENT_SIGNED_URL_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/rtf",
  "text/plain",
  "text/markdown",
]);
const MEDIA_MAX_BYTES = 100 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

function detectMediaKind(mime: string): MediaKind | null {
  if (mime.startsWith("image/")) return MEDIA_ROUTE_MIME_TYPES.has(mime) ? "image" : null;
  if (mime.startsWith("video/")) return MEDIA_ROUTE_MIME_TYPES.has(mime) ? "video" : null;
  if (mime.startsWith("audio/")) return MEDIA_ROUTE_MIME_TYPES.has(mime) ? "audio" : null;
  if (mime === "application/pdf" || DOCUMENT_SIGNED_URL_MIME_TYPES.has(mime)) return "document";
  return null;
}

const IP_TYPE_BY_KIND: Record<MediaKind, IPType> = {
  image: "NFT",
  audio: "Audio",
  video: "Video",
  document: "Documents",
};

const MEDIA_KIND_ICON: Record<MediaKind, typeof ImagePlus> = {
  image: ImagePlus,
  audio: Music,
  video: Video,
  document: FileText,
};

function ToggleGroup({
  value, options, onChange,
}: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden w-full">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 px-3 py-2 text-sm transition-colors",
            i > 0 && "border-l border-border",
            value === opt ? "bg-primary text-primary-foreground font-medium" : "bg-background hover:bg-muted text-muted-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function collectionDisplayLabel(col: ApiCollection) {
  return col.name || col.symbol || `Collection #${col.collectionId}`;
}

function CollectionThumb({ image }: { image: string | null | undefined }) {
  const imageUrl = image ? ipfsToHttp(image) : null;
  return (
    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Boxes className="h-4 w-4 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

function CollectionPicker({
  collections, value, onChange,
}: { collections: ApiCollection[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = collections.find((c) => c.collectionId === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/40"
        >
          <CollectionThumb image={selected?.image} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">
              {selected ? collectionDisplayLabel(selected) : collections.length ? "Choose a collection" : "No collections yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selected ? `${selected.totalSupply ?? 0} work${selected.totalSupply === 1 ? "" : "s"}` : "Where this work will live"}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-64 overflow-y-auto p-1">
          {collections.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No collections yet — create one instead.</p>
          ) : (
            collections.map((col) => {
              const isSelected = value === col.collectionId;
              return (
                <button
                  key={col.collectionId!}
                  type="button"
                  onClick={() => { onChange(col.collectionId!); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                >
                  <CollectionThumb image={col.image} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{collectionDisplayLabel(col)}</p>
                    <p className="text-xs text-muted-foreground">{col.totalSupply ?? 0} work{col.totalSupply === 1 ? "" : "s"}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand-blue shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface FormValues {
  name: string;
  description: string;
  external_url: string;
  licenseType: string;
  commercialUse: "Yes" | "No";
  derivatives: "Allowed" | "Not Allowed" | "Share-Alike";
  attribution: "Required" | "Not Required";
  geographicScope: string;
  aiPolicy: "Allowed" | "Not Allowed" | "Training Only";
  royalty: number;
}

export function FastMint(props: FastMintProps) {
  const {
    presentation = "inline", open = true, onClose, mediaKindLock, onMinted,
    collections, refetchCollections,
    hasWallet, walletAddress, onRequireWallet, connectLabel, getUploadToken, getSigner,
    client, provider,
  } = props;

  const [status, setStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<MediaKind>("image");
  const [mediaUploading, setMediaUploading] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [featurePreview, setFeaturePreview] = useState<string | null>(null);
  const [featureUri, setFeatureUri] = useState<string | null>(null);
  const [featureUploading, setFeatureUploading] = useState(false);
  const featurePreviewRef = useRef<string | null>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  const [assetType, setAssetType] = useState<"single" | "editions">("single");
  const [editionCount, setEditionCount] = useState("10");

  const [collectionMode, setCollectionMode] = useState<"existing" | "new">("existing");
  const [existingCollectionId, setExistingCollectionId] = useState("");
  const [existingCollectionContract, setExistingCollectionContract] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionSymbol, setNewCollectionSymbol] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [autoSymbol, setAutoSymbol] = useState("");
  const [autoCollectionName, setAutoCollectionName] = useState("");
  const [autoCollectionDescription, setAutoCollectionDescription] = useState("");

  const [ipType, setIpType] = useState<IPType>("NFT");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [ipTypeOpen, setIpTypeOpen] = useState(false);
  const templateFieldsRef = useRef<MetadataField[]>([]);

  const [mintedAsset, setMintedAsset] = useState<MintedAsset | null>(null);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    if (featurePreviewRef.current) URL.revokeObjectURL(featurePreviewRef.current);
  }, []);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "", description: "", external_url: "",
      licenseType: "CC BY-SA", commercialUse: "Yes", derivatives: "Share-Alike",
      attribution: "Required", geographicScope: "Worldwide", aiPolicy: "Not Allowed", royalty: 0,
    },
  });
  const name = form.watch("name");

  useEffect(() => {
    if (walletAddress && !form.getValues("external_url")) {
      form.setValue("external_url", `https://medialane.io/account/${walletAddress}`);
    }
  }, [walletAddress, form]);

  useEffect(() => {
    const s = suggestLaunchpadSymbol(name);
    if (!s) return;
    if (!newCollectionSymbol || newCollectionSymbol === autoSymbol) {
      setNewCollectionSymbol(s);
      setAutoSymbol(s);
    }
    if (!newCollectionName || newCollectionName === autoCollectionName) {
      setNewCollectionName(name);
      setAutoCollectionName(name);
    }
  }, [name, autoSymbol, autoCollectionName, newCollectionSymbol, newCollectionName]);

  const description = form.watch("description");
  useEffect(() => {
    if (!newCollectionDescription || newCollectionDescription === autoCollectionDescription) {
      setNewCollectionDescription(description);
      setAutoCollectionDescription(description);
    }
  }, [description, autoCollectionDescription, newCollectionDescription]);

  const erc721Collections = collections.filter((c) => getService(c.service)?.id === "mip-erc721");
  const erc1155Collections = collections.filter((c) => c.standard === "ERC1155");

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
    const viaMediaRoute = MEDIA_ROUTE_MIME_TYPES.has(file.type);
    const maxBytes = viaMediaRoute ? MEDIA_MAX_BYTES : DOCUMENT_MAX_BYTES;
    if (file.size > maxBytes) {
      setErrorMsg(`Maximum size is ${maxBytes / (1024 * 1024)} MB.`);
      return;
    }
    setMediaFile(file);
    setMediaKind(kind);
    setIpType(IP_TYPE_BY_KIND[kind]);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setMediaPreview(objectUrl);
    setMediaUri(null);
    setMediaUploading(true);
    try {
      const token = await getUploadToken();
      if (!token) throw new Error("Sign in first");
      const { uri } = await uploadFileToIpfs(file, token, viaMediaRoute ? "media" : "document");
      setMediaUri(uri);
    } catch (err) {
      const t = uploadFailureToast(err);
      setErrorMsg(t.description ?? t.title);
    } finally {
      setMediaUploading(false);
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaUri(null);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const handleFeatureSelect = async (file: File) => {
    if (featurePreviewRef.current) URL.revokeObjectURL(featurePreviewRef.current);
    const objectUrl = URL.createObjectURL(file);
    featurePreviewRef.current = objectUrl;
    setFeaturePreview(objectUrl);
    setFeatureUri(null);
    setFeatureUploading(true);
    try {
      const token = await getUploadToken();
      if (!token) throw new Error("Sign in first");
      const { uri } = await uploadFileToIpfs(file, token, "image");
      setFeatureUri(uri);
    } catch (err) {
      const t = uploadFailureToast(err);
      setErrorMsg(t.description ?? t.title);
    } finally {
      setFeatureUploading(false);
    }
  };

  const handleLicenseChange = (value: string) => {
    form.setValue("licenseType", value);
    const def = LICENSE_TYPES.find((l) => l.value === value);
    if (def) {
      form.setValue("commercialUse", def.commercialUse);
      form.setValue("derivatives", def.derivatives);
      form.setValue("attribution", def.attribution);
    }
  };

  const ready = !!mediaUri && !mediaUploading && name.trim().length > 0 &&
    (mediaKind === "image" || !!featureUri) &&
    (collectionMode === "existing"
      ? assetType === "single" ? !!existingCollectionId : !!existingCollectionContract
      : newCollectionName.trim().length > 0 && newCollectionSymbol.trim().length > 0);

  async function pollForNewCollection(name: string, symbol: string): Promise<ApiCollection | null> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const list = await refetchCollections();
      const match = list.find((c) => c.name === name && c.symbol === symbol);
      if (match?.collectionId) return match;
      await new Promise((r) => setTimeout(r, 1500));
    }
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    if (!hasWallet) { onRequireWallet(); return; }
    if (!walletAddress || !mediaUri) return;
    if (values.external_url && !values.external_url.startsWith("http://") && !values.external_url.startsWith("https://")) {
      setErrorMsg("External link must start with http:// or https://");
      return;
    }

    setStatus("minting");
    setErrorMsg(null);

    try {
      const signer: FastMintSigner = await getSigner();

      const image = mediaKind === "image" ? mediaUri : featureUri!;
      const animationUrl = mediaKind === "image" ? undefined : mediaUri;

      const built = buildAssetMetadata({
        name: values.name,
        description: values.description || "",
        externalUrl: values.external_url || "",
        imageUri: image,
        creator: walletAddress,
        ipType,
        licenseType: values.licenseType,
        commercialUse: values.commercialUse,
        derivatives: values.derivatives,
        attribution: values.attribution,
        geographicScope: values.geographicScope,
        aiPolicy: values.aiPolicy,
        royalty: String(values.royalty),
        templateTraits: templateFieldsRef.current
          .filter(({ traitType, value }) => traitType.trim() && value.trim())
          .map(({ traitType, value }) => ({ traitType, value })),
      });
      const metadata: Record<string, unknown> = { ...built };
      if (animationUrl) metadata.animation_url = animationUrl;

      const uploadToken = await getUploadToken();
      if (!uploadToken) throw new Error("Sign in first");
      const tokenUri = await uploadJsonToIpfs(metadata, uploadToken);

      let result: { txHash: string };
      let finalContractAddress: string | null;
      let finalTokenId: string | null = null;

      if (assetType === "single") {
        let collectionId = existingCollectionId;
        let contractAddress = erc721Collections.find((c) => c.collectionId === existingCollectionId)?.contractAddress ?? null;

        if (collectionMode === "new") {
          const intentRes = await client.api.createCollectionIntent({
            owner: walletAddress,
            name: newCollectionName,
            symbol: newCollectionSymbol,
            description: newCollectionDescription || undefined,
            image,
          });
          await executeIntent(provider, signer, client, intentRes.data);

          const found = await pollForNewCollection(newCollectionName, newCollectionSymbol);
          if (!found) throw new Error("Collection created, but it's still indexing — try minting again in a moment from My Collections.");
          collectionId = found.collectionId!;
          contractAddress = found.contractAddress ?? null;
        }

        const intentRes = await client.api.createMintIntent({
          owner: walletAddress,
          collectionId,
          recipient: walletAddress,
          tokenUri,
          royaltyBps: Math.round(values.royalty * 100),
        });
        if (!intentRes.data.requiresSignature) {
          const calls = intentRes.data.calls;
          contractAddress = calls[calls.length - 1]?.contractAddress ?? contractAddress;
        }
        result = await executeIntent(provider, signer, client, intentRes.data);
        finalContractAddress = contractAddress;

        if (finalContractAddress) {
          finalTokenId = await readMintedTokenId(provider, result.txHash, finalContractAddress);
        }
      } else {
        let collectionContract = existingCollectionContract;

        if (collectionMode === "new") {
          const intentRes = await client.api.createCollectionIntent({
            owner: walletAddress,
            name: newCollectionName,
            symbol: newCollectionSymbol,
            description: newCollectionDescription || undefined,
            image,
            baseUri: "",
            service: "mip-erc1155",
          });
          const deployResult = await executeIntent(provider, signer, client, intentRes.data);

          let receipt: { events?: { keys?: string[] }[] } | null = null;
          for (let attempt = 0; attempt < 3 && !receipt; attempt++) {
            try {
              if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
              const raw = await provider.getTransactionReceipt(deployResult.txHash);
              receipt = raw as { events?: { keys?: string[] }[] };
            } catch { /* retry */ }
          }
          const events = receipt?.events ?? [];
          const deployEvent = events.find((e) =>
            e.keys?.[0] && BigInt(e.keys[0]) === BigInt(COLLECTION_DEPLOYED_SELECTOR)
          );
          if (!deployEvent?.keys?.[1]) throw new Error("Collection deployed, but its address couldn't be read — check My Collections to mint into it.");
          collectionContract = normalizeAddress("STARKNET", deployEvent.keys[1]);
        }

        const intentRes = await client.api.createMintIntent({
          owner: walletAddress,
          recipient: walletAddress,
          collectionContract,
          tokenUri,
          value: editionCount,
          royaltyBps: Math.round(values.royalty * 100),
        });
        result = await executeIntent(provider, signer, client, intentRes.data);
        finalContractAddress = collectionContract;
        finalTokenId = await readMintedTokenId(provider, result.txHash, collectionContract);
      }

      if (finalContractAddress && finalTokenId) {
        const asset: MintedAsset = { contract: finalContractAddress, tokenId: finalTokenId, image };
        setMintedAsset(asset);
        onMinted?.(asset);
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const resetAll = () => {
    setStatus("idle");
    setErrorMsg(null);
    setMintedAsset(null);
    form.reset();
    clearMedia();
    setFeaturePreview(null);
    setFeatureUri(null);
    setAssetType("single");
    setEditionCount("10");
    setCollectionMode("existing");
    setExistingCollectionId("");
    setExistingCollectionContract("");
    setNewCollectionName("");
    setNewCollectionSymbol("");
    setNewCollectionDescription("");
    setAutoSymbol("");
    setAutoCollectionName("");
    setAutoCollectionDescription("");
    templateFieldsRef.current = [];
  };

  const busy = status === "minting";
  const KindIcon = MEDIA_KIND_ICON[mediaKind];
  const selectedExistingCollection = assetType === "single"
    ? erc721Collections.find((c) => c.collectionId === existingCollectionId)
    : erc1155Collections.find((c) => c.contractAddress === existingCollectionContract);
  const collectionLabel = mediaUri
    ? (collectionMode === "new"
      ? (newCollectionName || "New collection")
      : (selectedExistingCollection?.name || "IP Asset"))
    : undefined;

  const wrap = (node: React.ReactNode) => {
    if (presentation !== "dialog") return node;
    return (
      <ActionDialog open={open} onClose={onClose ?? (() => {})} width={640}>
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          {node}
        </div>
      </ActionDialog>
    );
  };

  if (status === "success") {
    return wrap(
      <SuccessView
        presentation={presentation}
        previewImage={mediaKind === "image" ? mediaPreview : featurePreview}
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

  return wrap(
    <section className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-border p-3">
        <div className="relative h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
          {mediaKind === "image" && mediaPreview ? (
            <Image src={mediaPreview} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <KindIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          {mediaUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold truncate">{mediaFile.name}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {mediaUploading ? "Uploading…" : mediaUri ? "Uploaded" : "Upload failed"}
            </p>
            {mediaUri && (() => {
              const template = IP_TEMPLATES[ipType];
              const TemplateIcon = template.icon;
              return (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium",
                    template.color.bg, template.color.text, template.color.border
                  )}
                >
                  <TemplateIcon className="h-3 w-3" />
                  {template.label}
                </span>
              );
            })()}
          </div>
        </div>
        <button
          type="button"
          onClick={() => mediaInputRef.current?.click()}
          className="text-xs font-semibold text-brand-blue hover:underline shrink-0"
        >
          Change
        </button>
        <input ref={mediaInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaSelect(f); }} />
      </div>

      {mediaUri && (
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
                value={form.watch("description")}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload a cover image for your asset *</label>
                <div className="flex items-center gap-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !featureUploading && featureInputRef.current?.click()}
                    onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !featureUploading) { e.preventDefault(); featureInputRef.current?.click(); } }}
                    className="relative h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {featurePreview ? (
                      <Image src={featurePreview} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    )}
                    {featureUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    <input ref={featureInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFeatureSelect(f); }} />
                  </div>
                  <p className="text-xs text-muted-foreground">Cover art shown wherever the work is previewed. JPG, PNG, GIF, SVG or WebP.</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Asset Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAssetType("single")}
                  className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    assetType === "single" ? "border-brand-blue bg-brand-blue/5" : "border-border hover:bg-muted/40")}
                >
                  <SingleIcon className={cn("h-5 w-5 shrink-0 mt-0.5", assetType === "single" ? "text-brand-blue" : "text-muted-foreground")} />
                  <span>
                    <span className="block text-sm font-semibold">Single Edition NFT</span>
                    <span className="block text-xs mt-0.5 text-muted-foreground">Minted once</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType("editions")}
                  className={cn("flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    assetType === "editions" ? "border-brand-blue bg-brand-blue/5" : "border-border hover:bg-muted/40")}
                >
                  <Layers className={cn("h-5 w-5 shrink-0 mt-0.5", assetType === "editions" ? "text-brand-blue" : "text-muted-foreground")} />
                  <span>
                    <span className="block text-sm font-semibold">Limited Editions NFT</span>
                    <span className="block text-xs mt-0.5 text-muted-foreground">Several numbered copies</span>
                  </span>
                </button>
              </div>
            </div>

            {assetType === "editions" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of copies</label>
                <Input
                  type="number"
                  min={1}
                  value={editionCount}
                  onChange={(e) => setEditionCount(e.target.value)}
                  className="max-w-[140px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Boxes className="h-4 w-4" />
                  Collection *
                </label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCollectionMode("existing")}
                    className={cn("px-3 h-7 text-xs font-medium transition-colors",
                      collectionMode === "existing" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground")}
                  >
                    Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionMode("new")}
                    className={cn("px-3 h-7 text-xs font-medium border-l border-border transition-colors flex items-center gap-1",
                      collectionMode === "new" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground")}
                  >
                    <Plus className="h-3 w-3" />New
                  </button>
                </div>
              </div>

              {collectionMode === "existing" ? (
                <CollectionPicker
                  collections={assetType === "single" ? erc721Collections : erc1155Collections}
                  value={assetType === "single" ? existingCollectionId : existingCollectionContract}
                  onChange={assetType === "single" ? setExistingCollectionId : setExistingCollectionContract}
                />
              ) : (
                <div className="flex gap-3 rounded-xl border border-border p-3">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    {(mediaKind === "image" ? mediaPreview : featurePreview) ? (
                      <Image
                        src={(mediaKind === "image" ? mediaPreview : featurePreview)!}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Boxes className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="grid grid-cols-[1fr_100px] gap-2">
                      <Input
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={newCollectionSymbol}
                        onChange={(e) => setNewCollectionSymbol(e.target.value.toUpperCase())}
                        placeholder="SYMBOL"
                        className="h-9 text-sm"
                      />
                    </div>
                    <Textarea
                      value={newCollectionDescription}
                      onChange={(e) => setNewCollectionDescription(e.target.value)}
                      placeholder="Describe this collection…"
                      rows={2}
                      className="text-sm resize-none"
                    />
                    <p className="text-2xs text-muted-foreground">Prefilled from your asset — edit anything above.</p>
                  </div>
                </div>
              )}
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <div className="rounded-xl border border-border overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Licensing Terms</span>
                      <span className="text-xs text-muted-foreground font-normal">Optional · Berne Convention</span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", advancedOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">License</label>
                      <Select value={form.watch("licenseType")} onValueChange={handleLicenseChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Commercial use</label>
                      <ToggleGroup value={form.watch("commercialUse")} options={["Yes", "No"]} onChange={(v) => form.setValue("commercialUse", v as "Yes" | "No")} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Derivatives</label>
                      <ToggleGroup value={form.watch("derivatives")} options={DERIVATIVES_OPTIONS} onChange={(v) => form.setValue("derivatives", v as FormValues["derivatives"])} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Territory</label>
                      <Select value={form.watch("geographicScope")} onValueChange={(v) => form.setValue("geographicScope", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GEOGRAPHIC_SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">AI &amp; data mining</label>
                      <ToggleGroup value={form.watch("aiPolicy")} options={AI_POLICIES} onChange={(v) => form.setValue("aiPolicy", v as FormValues["aiPolicy"])} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Royalty % (0–50)</label>
                      <Input
                        type="number" min={0} max={50} step={0.5}
                        value={form.watch("royalty")}
                        onChange={(e) => form.setValue("royalty", parseFloat(e.target.value) || 0)}
                        className="max-w-[120px]"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            <Collapsible open={ipTypeOpen} onOpenChange={setIpTypeOpen}>
              <div className="rounded-xl border border-border overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">IP Type &amp; Metadata</span>
                      <span className="text-xs text-muted-foreground font-normal">Optional</span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", ipTypeOpen && "rotate-180")} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">IP Type</label>
                      <Select value={ipType} onValueChange={(v) => setIpType(v as IPType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {IP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <IPTypeFields
                      ipType={ipType}
                      onChange={(fields) => { templateFieldsRef.current = fields; }}
                      uploadDocument={async (file) => {
                        const token = await getUploadToken();
                        if (!token) throw new Error("Sign in first");
                        const { uri } = await uploadFileToIpfs(file, token, "document");
                        return uri;
                      }}
                      existingDocument={mediaKind === "document" && mediaUri && mediaFile ? { uri: mediaUri, name: mediaFile.name } : null}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {status === "error" && errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

            <button
              type="button"
              disabled={!ready || busy || !hasWallet}
              onClick={form.handleSubmit(onSubmit)}
              className={cn(
                "w-full h-12 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] bg-brand-blue",
                (!ready || busy || !hasWallet) && "opacity-40 pointer-events-none"
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
              image={mediaKind === "image" ? mediaPreview : featurePreview}
              name={name}
              collection={collectionLabel}
              creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
              creatorHref={walletAddress ? `/account/${walletAddress}` : undefined}
            />
          </div>
        </div>
      )}
    </section>
  );
}
