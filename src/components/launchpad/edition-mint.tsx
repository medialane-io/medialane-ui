"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { assetHref, normalizeAddress, profileHref } from "@medialane/sdk";
import { mintedTokenIdFromReceipt } from "@medialane/sdk/starknet";
import Link from "../link.js";
import { Button } from "../button.js";
import { Form } from "../form.js";
import { ClaimRouteShell } from "../claim-route-shell.js";
import { TransactionSuccess } from "../transaction-success.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { TransactionDialog } from "../transaction-dialog.js";
import { WalletRequired } from "../wallet-required.js";
import { useMedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import type { MetadataField } from "../ip-type-fields.js";
import { EditionMintFields } from "./edition-mint-fields.js";
import { editionMintSchema, type EditionMintValues } from "./edition-mint-schema.js";
import { runIntentCalls } from "../../utils/run-intent-calls.js";
import { pinAssetMetadata, uploadFileToIpfs } from "../../utils/ipfs-upload.js";
import { useTransaction } from "../../utils/use-transaction.js";
import { useLaunchpadImageUpload } from "../../utils/use-launchpad-image-upload.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";

const DEFAULTS: EditionMintValues = {
  value: "1",
  recipient: "",
  name: "",
  description: "",
  external_url: "",
  ipType: "NFT",
  licenseType: "CC BY-SA",
  commercialUse: "Yes",
  derivatives: "Share-Alike",
  attribution: "Required",
  geographicScope: "Worldwide",
  aiPolicy: "Not Allowed",
  royalty: 0,
};

export function EditionMint({ contract: rawContract, aside }: { contract: string; aside?: ReactNode }) {
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const collectionAddress = normalizeAddress("STARKNET", rawContract);
  const tx = useTransaction();
  const upload = useLaunchpadImageUpload({ successMessage: "Image uploaded to IPFS", failureMessage: "Image upload failed" });
  const { imagePreview, imageUri, imageUploading, uploadError, uploadSuccess, fileInputRef, handleImageSelect, clearImage } = upload;
  const [ownerCheck, setOwnerCheck] = useState<"loading" | "ok" | "denied">("loading");
  const [formError, setFormError] = useState<string | null>(null);
  const [metadataResetKey, setMetadataResetKey] = useState(0);
  const [autoExternalUrl, setAutoExternalUrl] = useState("");
  const metadataFieldsRef = useRef<MetadataField[]>([]);

  const form = useForm<EditionMintValues>({ resolver: zodResolver(editionMintSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (walletAddress && !form.getValues("recipient")) form.setValue("recipient", walletAddress);
  }, [walletAddress, form]);

  useEffect(() => {
    const suggested = `https://medialane.io/collections/${collectionAddress}`;
    const current = form.getValues("external_url");
    if (!current || current === autoExternalUrl) {
      form.setValue("external_url", suggested, { shouldDirty: false });
      setAutoExternalUrl(suggested);
    }
  }, [autoExternalUrl, collectionAddress, form]);

  useEffect(() => {
    if (!walletAddress) return;
    app
      .getClient()
      .api.collections.get(collectionAddress)
      .then((data) => {
        const owner = data.owner ? normalizeAddress("STARKNET", data.owner) : null;
        setOwnerCheck(owner === normalizeAddress("STARKNET", walletAddress) ? "ok" : "denied");
      })
      .catch(() => setOwnerCheck("denied"));
  }, [app, walletAddress, collectionAddress]);

  const uploadDocument = async (file: File) => {
    await app.ensureSignedIn?.();
    return (await uploadFileToIpfs(app.getClient().api, file, "document")).uri;
  };

  const handleAgain = () => {
    tx.reset();
    metadataFieldsRef.current = [];
    setMetadataResetKey((key) => key + 1);
    setAutoExternalUrl("");
    clearImage();
    form.reset({ ...DEFAULTS, recipient: walletAddress ?? "" });
  };

  const onSubmit = (values: EditionMintValues) => {
    if (!imageUri) {
      setFormError("Upload an image before minting.");
      return;
    }
    if (!walletAddress) return;
    setFormError(null);
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const pinned = await pinAssetMetadata(api, {
        name: values.name,
        description: values.description ?? "",
        imageUri,
        externalUrl: values.external_url,
        ipType: values.ipType,
        licenseType: values.licenseType,
        commercialUse: values.commercialUse,
        derivatives: values.derivatives,
        attribution: values.attribution,
        geographicScope: values.geographicScope,
        aiPolicy: values.aiPolicy,
        royalty: String(values.royalty),
        creator: walletAddress,
        templateTraits: metadataFieldsRef.current.filter((f) => f.traitType.trim() && f.value.trim()).map((f) => ({ traitType: f.traitType.trim(), value: f.value.trim() })),
      });
      await runIntentCalls(signer, () =>
        api.intents.create("mint", {
          owner: walletAddress,
          recipient: values.recipient,
          collectionContract: collectionAddress,
          tokenUri: pinned.uri,
          value: values.value,
          royaltyBps: 0,
        }),
      );
      invalidatePortfolioCache(walletAddress);
    });
  };

  const mintedTokenId = tx.receipt ? mintedTokenIdFromReceipt(tx.receipt, collectionAddress) : null;

  return (
    <WalletRequired
      icon={Sparkles}
      iconClassName="text-brand-purple"
      title="Secure your account to create"
      description="Secure your account to mint tokens into a multi-editions collection."
    >
      {ownerCheck === "denied" ? (
        <div className="max-w-lg mx-auto px-4 pt-24 pb-8 text-center space-y-4">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Not the owner</h1>
          <p className="text-muted-foreground">Only the collection owner can mint tokens. Connect the wallet that deployed this collection.</p>
          <Button asChild variant="outline">
            <Link href="/launchpad">Back to Launchpad</Link>
          </Button>
        </div>
      ) : (
        <>
          <ClaimRouteShell
            icon={<Sparkles className="h-4 w-4 text-white" />}
            title="Mint an Edition"
            subtitle="Add a new piece to your collection — its details and authorship are saved permanently. Free to mint, and it's yours."
            headerAccessory={
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 max-w-full">
                <span className="tabular-nums text-xs text-foreground/80 truncate">Collection: {collectionAddress}</span>
              </div>
            }
            aside={
              <>
                <MedialaneCollectionCard
                  image={imagePreview}
                  name={form.watch("name")}
                  collection="Edition"
                  serial={Number(form.watch("value")) > 1 ? `${form.watch("value")} editions` : undefined}
                  creator={walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : undefined}
                  creatorHref={walletAddress ? profileHref({ address: walletAddress }) : undefined}
                />
                {aside}
              </>
            }
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <EditionMintFields
                  form={form}
                  imagePreview={imagePreview}
                  imageUri={imageUri}
                  imageUploading={imageUploading}
                  mintDisabled={imageUploading || tx.phase !== "idle"}
                  fileInputRef={fileInputRef}
                  onImageSelect={handleImageSelect}
                  onClearImage={clearImage}
                  metadataResetKey={metadataResetKey}
                  onMetadataFieldsChange={(fields) => { metadataFieldsRef.current = fields; }}
                  uploadDocument={uploadDocument}
                />
                {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
                {uploadSuccess && <p className="text-xs text-emerald-500 mt-1">✓ {uploadSuccess}</p>}
                {formError && <p className="text-xs text-destructive mt-1">{formError}</p>}
              </form>
            </Form>
          </ClaimRouteShell>

          <TransactionDialog tx={tx} title="Mint an edition" workingLabel="Minting your edition…" firstStepLabel="Upload metadata">
            <TransactionSuccess
              name={form.getValues("name") || "Your token"}
              image={imagePreview}
              title="Editions minted"
              description="Each copy is recorded onchain with the license terms in its metadata."
              actions={[
                ...(mintedTokenId ? [{ href: assetHref("STARKNET", collectionAddress, mintedTokenId), label: "View asset" }] : []),
                { href: "/portfolio/assets", label: "View portfolio" },
                { label: "Mint another", onClick: handleAgain },
              ]}
            >
              <RewardEarned actionType="mint_asset" />
            </TransactionSuccess>
          </TransactionDialog>
        </>
      )}
    </WalletRequired>
  );
}
