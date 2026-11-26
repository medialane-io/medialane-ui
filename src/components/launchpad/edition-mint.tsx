"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { PageState } from "../page-state.js";
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
import { useImageUpload } from "../../utils/use-image-upload.js";
import { invalidatePortfolioCache } from "../../utils/portfolio-cache.js";
import { useT } from "../../i18n/provider.js";
import { msg } from "../../i18n/translate.js";

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
  aiPolicy: "Allowed",
  royalty: 0,
};

export function EditionMint({ contract: rawContract, aside }: { contract: string; aside?: ReactNode }) {
  const t = useT();
  const app = useMedialaneApp();
  const walletAddress = app.walletAddress;
  const collectionAddress = normalizeAddress("STARKNET", rawContract);
  const tx = useTransaction();
  const upload = useImageUpload();
  const [ownerCheck, setOwnerCheck] = useState<"loading" | "ok" | "denied">("loading");
  const [collectionName, setCollectionName] = useState<string | null>(null);
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
        setCollectionName(data.name ?? null);
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
    upload.clear();
    form.reset({ ...DEFAULTS, recipient: walletAddress ?? "" });
  };

  const onSubmit = (values: EditionMintValues) => {
    if (!upload.confirm(msg("Upload an image before publishing."))) return;
    if (!walletAddress) return;
    void tx.run(async (signer) => {
      await app.ensureSignedIn?.();
      const api = app.getClient().api;
      const pinned = await pinAssetMetadata(api, {
        name: values.name,
        description: values.description ?? "",
        imageUri: upload.uri,
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
          royaltyBps: Math.round(values.royalty * 100),
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
      title={t("Secure your account to publish")}
      description={t("Secure your account to publish editions.")}
    >
      {ownerCheck === "denied" ? (
        <PageState icon={Sparkles} title={t("Owner only")} description={t("Publishing is open to the collection owner.")}>
          <Button asChild variant="soft">
            <Link href="/launchpad">{t("Back to Launchpad")}</Link>
          </Button>
        </PageState>
      ) : (
        <>
          <ClaimRouteShell
            icon={<Sparkles className="h-4 w-4 text-white" />}
            title={t("Mint a limited edition NFT")}
            headerAccessory={
              collectionName ? (
                <div data-testid="collection-name" className="panel flex items-center gap-2 px-3 py-2 max-w-full">
                  <span className="text-xs text-foreground/80 truncate">{collectionName}</span>
                </div>
              ) : undefined
            }
            aside={
              <>
                <MedialaneCollectionCard
                  image={upload.preview}
                  name={form.watch("name")}
                  collection={t("Edition")}
                  serial={Number(form.watch("value")) > 1 ? t("{count} editions", { count: form.watch("value") }) : undefined}
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
                  upload={upload}
                  mintDisabled={upload.uploading || tx.phase !== "idle"}
                  metadataResetKey={metadataResetKey}
                  onMetadataFieldsChange={(fields) => { metadataFieldsRef.current = fields; }}
                  uploadDocument={uploadDocument}
                />
              </form>
            </Form>
          </ClaimRouteShell>

          <TransactionDialog tx={tx} title={t("Mint Limited Editions")} workingLabel={t("Publishing your edition…")} firstStepLabel={t("Saving details")}>
            <TransactionSuccess
              name={form.getValues("name") || t("Your work")}
              image={upload.preview}
              title={t("Edition published")}
              description={t("Each copy is saved permanently with its license terms.")}
              actions={[
                ...(mintedTokenId ? [{ href: assetHref("STARKNET", collectionAddress, mintedTokenId), label: t("View work") }] : []),
                { href: "/portfolio/assets", label: t("View portfolio") },
                { label: t("Publish another"), onClick: handleAgain },
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
