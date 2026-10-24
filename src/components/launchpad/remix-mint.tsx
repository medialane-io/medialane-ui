"use client";

import { useEffect, useRef, useState } from "react";
import { Boxes, ChevronDown, ChevronLeft, GitBranch, ImagePlus, Info, Percent, Plus, Shield, Upload } from "lucide-react";
import { assetHref, getDerivativesTerm, getService, normalizeAddress, resolveRemixPolicy } from "@medialane/sdk";
import { acceptFor, uploadError } from "../../utils/upload-limits.js";
import { assertTransactionSucceeded, mintedTokenIdFromReceipt } from "@medialane/sdk/starknet";
import Image from "../image.js";
import Link from "../link.js";
import { useRouter } from "../router.js";
import { Badge } from "../badge.js";
import { Button } from "../button.js";
import { Input } from "../input.js";
import { Label } from "../label.js";
import { Skeleton } from "../skeleton.js";
import { Textarea } from "../textarea.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { Section, ToggleGroup } from "../create-form-primitives.js";
import { CreationSuccess } from "../creation-success.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import { IP_TYPES, LICENSE_TYPES } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";
import { pinAssetMetadata, uploadJsonToIpfs } from "../../utils/ipfs-upload.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { checkIsOwner } from "../../utils/ownership.js";
import { useCollection, useCollectionsByOwner } from "../../utils/use-collections.js";
import { useToken, useTokenBalance } from "../../utils/use-tokens.js";
import { useImageUrl } from "../../utils/use-image-url.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";

export function RemixMint({ contract, tokenId }: { contract: string; tokenId: string }) {
  const app = useMedialaneApp();
  const router = useRouter();
  const resolveImage = useImageUrl();
  const walletAddress = app.walletAddress;
  const tx = useTransaction();
  const { token, isLoading: tokenLoading } = useToken(contract, tokenId);
  const { collection: parentCollection } = useCollection(contract);
  const { collections: allCollections, isLoading: collectionsLoading } = useCollectionsByOwner(walletAddress ?? null);
  const eligibleCollections = allCollections.filter(
    (c) => getService(c.service)?.id === "mip-erc1155" || (getService(c.service)?.id === "mip-erc721" && c.collectionId != null),
  );
  const { amount: walletBalance } = useTokenBalance(contract, tokenId, walletAddress);
  const viewerIsOwner = checkIsOwner(token, walletAddress, walletBalance);

  const originalName = token?.metadata?.name ?? `Token #${tokenId}`;
  const originalImage = resolveImage(token?.metadata?.image);
  const originalAttributes = Array.isArray(token?.metadata?.attributes)
    ? (token!.metadata!.attributes as { trait_type?: string; value?: string }[])
    : [];
  const attr = (t: string) => originalAttributes.find((a) => a.trait_type === t)?.value;

  const remixPolicy = resolveRemixPolicy({
    parentNoDerivatives: getDerivativesTerm(originalAttributes) === "Not Allowed",
    viewerIsParentOwner: viewerIsOwner,
    dealAvailable: !!getService(parentCollection?.service),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collectionKey, setCollectionKey] = useState("");
  const [ipType, setIpType] = useState<string>("Art");
  const [licenseType, setLicenseType] = useState("CC BY");
  const [commercial, setCommercial] = useState(false);
  const [derivatives, setDerivatives] = useState(true);
  const [royalty, setRoyalty] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [remixHref, setRemixHref] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (token && !name) setName(`Remix of ${originalName}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the token loads; name is guarded by the check above
  }, [token]);

  const getCollectionKey = (c: (typeof eligibleCollections)[number]) => c.collectionId ?? c.contractAddress;

  useEffect(() => {
    if (eligibleCollections.length > 0 && !collectionKey) {
      const match = eligibleCollections.find((c) => normalizeAddress("STARKNET", c.contractAddress) === normalizeAddress("STARKNET", contract));
      setCollectionKey(getCollectionKey(match ?? eligibleCollections[0]!));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the eligible collections first load
  }, [eligibleCollections.length]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const redirected = useRef(false);
  useEffect(() => {
    if (!token || remixPolicy.canRemixDirect || redirected.current) return;
    redirected.current = true;
    router.replace(assetHref("STARKNET", contract, tokenId));
  }, [token, remixPolicy.canRemixDirect, router, contract, tokenId]);

  const handleLicenseChange = (value: string) => {
    setLicenseType(value);
    const preset = LICENSE_TYPES.find((l) => l.value === value);
    if (preset) {
      setCommercial(preset.commercialUse === "Yes");
      setDerivatives(preset.derivatives !== "Not Allowed");
    }
  };

  const handleImageChange = (file: File) => {
    const fileError = uploadError(file, "image");
    if (fileError) {
      setFormError(fileError);
      return;
    }
    setFormError(null);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  };

  const handleSubmit = () => {
    if (!name.trim()) return setFormError("Remix name is required");
    if (!collectionKey) return setFormError("Select a collection");
    if (!walletAddress) return;
    setFormError(null);
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const client = app.getClient();
      const api = client.api;
      const selected = eligibleCollections.find((c) => getCollectionKey(c) === collectionKey);
      if (!selected) throw new Error("Collection not found");

      let tokenUri: string;
      if (imageFile) {
        tokenUri = (
          await pinAssetMetadata(api, {
            imageFile,
            name: name.trim(),
            description: description.trim() || `Remix of ${originalName}`,
            creator: walletAddress,
            ipType,
            licenseType,
            commercialUse: commercial ? "Yes" : "No",
            derivatives: derivatives ? "Allowed" : "Not Allowed",
            attribution: "Required",
            geographicScope: "Worldwide",
            aiPolicy: "Not Allowed",
            royalty: royalty || "0",
            templateTraits: [
              { traitType: "Parent Contract", value: contract },
              { traitType: "Parent Token ID", value: tokenId },
            ],
          })
        ).uri;
      } else {
        tokenUri = await uploadJsonToIpfs(api, {
          name: name.trim(),
          description: description.trim() || `Remix of ${originalName}`,
          image: token?.metadata?.image ?? "",
          attributes: [
            { trait_type: "Parent Contract", value: contract },
            { trait_type: "Parent Token ID", value: tokenId },
            { trait_type: "Remix Type", value: "Derivative" },
            { trait_type: "IP Type", value: ipType },
            { trait_type: "License", value: licenseType },
            { trait_type: "Commercial Use", value: commercial ? "Yes" : "No" },
            { trait_type: "Derivatives", value: derivatives ? "Allowed" : "Not Allowed" },
            ...(royalty ? [{ trait_type: "Royalty", value: `${royalty}%` }] : []),
            { trait_type: "Creator", value: walletAddress },
          ],
        });
      }

      const { txHash } = await runIntentCalls(signer, () =>
        api.intents.create(
          "mint",
          selected.standard === "ERC1155"
            ? { owner: walletAddress, recipient: walletAddress, collectionContract: selected.contractAddress, tokenUri, value: "1" }
            : { owner: walletAddress, collectionId: selected.collectionId!, recipient: walletAddress, tokenUri, royaltyBps: 0 },
        ),
      );
      const receipt = await assertTransactionSucceeded(client.provider, txHash);
      const remixTokenId = mintedTokenIdFromReceipt(receipt, selected.contractAddress);
      if (!remixTokenId) throw new Error("Minted, but could not read the new token id from the receipt");
      await api.remix.confirmSelf({
        originalContract: contract,
        originalTokenId: tokenId,
        remixContract: selected.contractAddress,
        remixTokenId,
        txHash,
        licenseType,
        commercial,
        derivatives,
      });
      setRemixHref(assetHref("STARKNET", selected.contractAddress, remixTokenId));
      invalidatePortfolioCache(walletAddress);
    });
  };

  const handleAgain = () => {
    tx.reset();
    setRemixHref(null);
  };

  const gate = { icon: GitBranch, title: "Connect to create a remix", description: "Connect to mint a derivative of this asset." };

  if (tokenLoading) {
    return (
      <WalletRequired {...gate}>
        <div className="max-w-5xl mx-auto px-4 pt-14 pb-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </WalletRequired>
    );
  }

  if (!token) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-2xl font-bold">Asset not found</p>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    );
  }

  return (
    <WalletRequired {...gate}>
      <TransactionDialog tx={tx} title="Mint a remix" workingLabel="Minting your remix…" firstStepLabel="Upload to IPFS">
        <CreationSuccess
          name={name}
          image={imagePreview ?? originalImage ?? null}
          caption="Your remix is live"
          primary={remixHref ? { href: remixHref, label: "View remix" } : { href: "/portfolio/assets", label: "View portfolio" }}
          secondary={remixHref ? { href: "/portfolio/assets", label: "View portfolio" } : undefined}
          onAgain={handleAgain}
          againLabel="Close"
        >
          <RewardEarned actionType="mint_asset" />
        </CreationSuccess>
      </TransactionDialog>

      <div className="max-w-5xl mx-auto px-4 pt-14 pb-12 space-y-6">
        <div className="space-y-3">
          <Link href={assetHref("STARKNET", contract, tokenId)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to asset
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <GitBranch className="h-5 w-5" />
            <span className="text-sm font-semibold">Create Remix</span>
          </div>
          <h1 className="text-3xl font-bold">Mint a Remix</h1>
          <p className="text-muted-foreground max-w-xl">Mint a derivative work based on this asset. The parent attribution is embedded in the IPFS metadata.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-4">
            <Section title="Remix Artwork" icon={<ImagePlus className="h-4 w-4" />}>
              <div
                className={cn("relative group rounded-xl border-2 border-dashed border-border transition-colors cursor-pointer overflow-hidden", "hover:border-primary/50 hover:bg-muted/30")}
                onClick={() => fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept={acceptFor("image")} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f); }} />
                {imagePreview ? (
                  <div className="relative aspect-square w-full">
                    <Image src={imagePreview} alt="Remix preview" fill unoptimized className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4" /> Change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
                    {originalImage && (
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden opacity-40 mb-1 ring-2 ring-border">
                        <Image src={originalImage} alt="" fill unoptimized className="object-cover" />
                      </div>
                    )}
                    <Upload className="h-8 w-8" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Upload remix artwork</p>
                      <p className="text-xs mt-0.5">{originalImage ? "Leave empty to inherit original artwork" : "PNG, JPG, GIF, WebP up to 10MB"}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Remix Details" icon={<GitBranch className="h-4 w-4" />}>
              <div className="space-y-1.5">
                <Label>Remix Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`Remix of ${originalName}`} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your remix, the creative changes you're making, or your vision for it…" rows={3} className="resize-none" />
              </div>
            </Section>

            <Section title="Collection" icon={<Boxes className="h-4 w-4" />}>
              {collectionsLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : eligibleCollections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">No eligible collections. Create one first.</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/launchpad/single-editions/collection"><Plus className="h-3.5 w-3.5 mr-1.5" />Create collection</Link>
                  </Button>
                </div>
              ) : (
                <Select value={collectionKey} onValueChange={setCollectionKey}>
                  <SelectTrigger><SelectValue placeholder="Select a collection" /></SelectTrigger>
                  <SelectContent>
                    {eligibleCollections.map((c) => (
                      <SelectItem key={getCollectionKey(c)} value={getCollectionKey(c)}>
                        <span className="flex items-center gap-2">
                          {c.name ?? c.contractAddress.slice(0, 14) + "…"}
                          {c.standard && <span className="text-2xs tabular-nums text-muted-foreground">{c.standard}</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Section>

            <Section title="IP Type" icon={<Info className="h-4 w-4" />}>
              <Select value={ipType} onValueChange={setIpType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{IP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Section>

            <Section title="License Terms" icon={<Shield className="h-4 w-4" />}>
              <div className="space-y-1.5">
                <Label>License Type</Label>
                <Select value={licenseType} onValueChange={handleLicenseChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{l.value}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Commercial Use</Label>
                  <ToggleGroup value={commercial ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => setCommercial(v === "Yes")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Derivatives</Label>
                  <ToggleGroup value={derivatives ? "Allowed" : "Not Allowed"} options={["Allowed", "Not Allowed"]} onChange={(v) => setDerivatives(v === "Allowed")} />
                </div>
              </div>
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
                    Royalty & advanced
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5"><Percent className="h-3.5 w-3.5" />Royalty %</Label>
                    <Input type="number" min="0" max="50" step="1" placeholder="0" value={royalty} onChange={(e) => setRoyalty(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Percentage of future sales sent back to you (0–50%)</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Section>

            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}

            <div className="btn-border-animated p-[1px] rounded-xl">
              <button
                type="button"
                disabled={tx.phase !== "idle"}
                onClick={handleSubmit}
                className="w-full h-12 rounded-[11px] flex items-center justify-center gap-2 text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] bg-brand-rose disabled:opacity-50"
              >
                <GitBranch className="h-5 w-5" />
                Mint Remix
              </button>
            </div>
            <p className="text-xs text-center text-muted-foreground">Two operations: IPFS metadata upload + on-chain mint. Gas is free.</p>
          </div>

          <div className="space-y-4 lg:sticky lg:top-16">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="relative aspect-square w-full bg-muted">
                {originalImage && <Image src={originalImage} alt={originalName} fill unoptimized className="object-cover" />}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-2xs gap-1"><GitBranch className="h-3 w-3" />Original</Badge>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="font-semibold truncate">{originalName}</p>
                  {token.metadata?.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{token.metadata.description}</p>}
                </div>
                {(attr("License") || attr("Commercial Use") || attr("Derivatives")) && (
                  <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
                    <p className="text-2xs font-semibold text-muted-foreground">Original License</p>
                    {attr("License") && <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-medium">{attr("License")}</span></div>}
                    {attr("Commercial Use") && <div className="flex justify-between"><span className="text-muted-foreground">Commercial</span><span className="font-medium">{attr("Commercial Use")}</span></div>}
                    {attr("Derivatives") && <div className="flex justify-between"><span className="text-muted-foreground">Derivatives</span><span className="font-medium">{attr("Derivatives")}</span></div>}
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 text-sm">
              <p className="font-semibold flex items-center gap-2"><Info className="h-4 w-4 text-primary" />What happens next</p>
              <ol className="space-y-2 text-muted-foreground text-xs list-decimal list-inside">
                <li>Your artwork and metadata are uploaded to IPFS</li>
                <li>A new NFT is minted in the selected collection</li>
                <li>Parent attribution is embedded on-chain permanently</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </WalletRequired>
  );
}
