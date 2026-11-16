"use client";

import { ArrowRightLeft, Eye, GitBranch, ImagePlus, Layers, Tag } from "lucide-react";
import { buildAssetMetadata, getCoordinates } from "@medialane/sdk";
import {
  createdCollectionAddress,
  createdCollectionFromReceipt,
  deployedCollectionFromReceipt,
  executeIntent,
  mintedTokenIdFromReceipt,
} from "@medialane/sdk/starknet";
import { Input } from "../../input.js";
import { uploadJsonToIpfs } from "../../../utils/ipfs-upload.js";
import { CollectionSection, type CollectionMode } from "../collection-section.js";
import { LicensingSection } from "../licensing-section.js";
import { IpTypeSection } from "../ip-type-section.js";
import { collectionKey, mintableCollections, type MintAssetType } from "../mintable-collections.js";
import { createThenAdd } from "../create-then-add.js";
import { defineFormat, type FormatFieldsProps, type FormatResult, type FormatRuntime, type FormatShared } from "./types.js";

interface NftState {
  mode: CollectionMode;
  existingId: string;
  existingContract: string;
  editionCount: string;
}

interface SingleDestination {
  collectionId: string;
  contract: string | null;
}

function assetLinks(contract: string | null, tokenId: string | null): FormatResult["links"] {
  if (!contract || !tokenId) return [];
  const asset = `/asset/STARKNET/${contract}/${tokenId}`;
  return [
    { href: asset, label: "View asset", icon: Eye },
    { href: `${asset}?action=list`, label: "Sell on marketplace", icon: Tag },
    { href: `${asset}?action=transfer`, label: "Transfer", icon: ArrowRightLeft },
    { href: `/create/remix/${contract}/${tokenId}`, label: "Create a remix", icon: GitBranch },
  ];
}

async function pinTokenUri(shared: FormatShared, runtime: FormatRuntime): Promise<string> {
  const values = shared.form.getValues();
  const built = buildAssetMetadata({
    name: values.name,
    description: values.description || "",
    externalUrl: values.external_url || "",
    imageUri: shared.image,
    creator: shared.walletAddress,
    ipType: shared.ipType,
    licenseType: values.licenseType,
    commercialUse: values.commercialUse,
    derivatives: values.derivatives,
    attribution: values.attribution,
    geographicScope: values.geographicScope,
    aiPolicy: values.aiPolicy,
    royalty: String(values.royalty),
    templateTraits: shared.templateFieldsRef.current
      .filter(({ traitType, value }) => traitType.trim() && value.trim())
      .map(({ traitType, value }) => ({ traitType, value })),
  });
  const metadata: Record<string, unknown> = { ...built };
  if (shared.mediaKind !== "image") metadata.animation_url = shared.mediaUri;

  const uploadToken = await runtime.getUploadToken();
  if (!uploadToken) throw new Error("Sign in first");
  return uploadJsonToIpfs(runtime.client.api, metadata);
}

function makeNftFormat(kind: MintAssetType) {
  const single = kind === "single";

  function Fields({ shared, state, update }: FormatFieldsProps<NftState>) {
    return (
      <>
        {!single && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="fast-mint-copies">Number of copies</label>
            <Input
              id="fast-mint-copies"
              type="number"
              min={1}
              value={state.editionCount}
              onChange={(e) => update({ editionCount: e.target.value })}
              className="max-w-[140px]"
            />
          </div>
        )}
        <CollectionSection
          mode={state.mode}
          onModeChange={(mode) => update({ mode })}
          collections={mintableCollections(kind, shared.collections)}
          value={single ? state.existingId : state.existingContract}
          onValue={(value) => update(single ? { existingId: value } : { existingContract: value })}
          valueOf={collectionKey(kind)}
          draft={shared.draft}
          previewImage={shared.previewImage}
        />
        <LicensingSection form={shared.form} />
        <IpTypeSection
          ipType={shared.ipType}
          onIpTypeChange={shared.onIpTypeChange}
          fieldsRef={shared.templateFieldsRef}
          uploadDocument={shared.uploadDocument}
          existingDocument={shared.mediaKind === "document" ? { uri: shared.mediaUri, name: shared.mediaName } : null}
        />
      </>
    );
  }

  const selected = (shared: FormatShared, state: NftState) =>
    mintableCollections(kind, shared.collections).find((c) => collectionKey(kind)(c) === (single ? state.existingId : state.existingContract));

  return defineFormat<NftState>({
    key: kind,
    title: single ? "Single NFT" : "Limited Editions",
    hint: single ? "One copy, yours to keep or sell" : "Numbered copies people can collect",
    icon: single ? ImagePlus : Layers,
    submitLabel: () => (single ? "Mint NFT" : "Mint Editions"),
    initial: () => ({ mode: "existing", existingId: "", existingContract: "", editionCount: "10" }),
    Fields,
    isReady: (shared, state) => {
      if (!single && !/^[1-9]\d*$/.test(state.editionCount.trim())) return false;
      if (state.mode === "new") return shared.draft.name.trim().length > 0 && shared.draft.symbol.trim().length > 0;
      return (single ? state.existingId : state.existingContract) !== "";
    },
    previewLabel: (shared, state) =>
      state.mode === "new" ? shared.draft.name || "New collection" : selected(shared, state)?.name || "IP Asset",
    submit: async (shared, state, runtime) => {
      const { client, signer, onStep } = runtime;
      const owner = shared.walletAddress;
      const values = shared.form.getValues();
      const tokenUri = await pinTokenUri(shared, runtime);
      const royaltyBps = Math.round(values.royalty * 100);
      const labels = { create: "Creating the collection", add: single ? "Minting" : "Minting editions" };

      if (single) {
        const picked = state.mode === "existing" ? selected(shared, state) : undefined;
        const existing: SingleDestination | null =
          (runtime.resume as SingleDestination | null) ??
          (picked?.collectionId ? { collectionId: picked.collectionId, contract: picked.contractAddress ?? null } : null);

        const result = await createThenAdd<SingleDestination, { contract: string | null; tokenId: string | null }>({
          existing,
          noun: "collection",
          labels,
          onStep,
          create: async () => {
            const created = await client.api.intents.create("create-collection", {
              owner,
              name: shared.draft.name,
              symbol: shared.draft.symbol,
              description: shared.draft.description || undefined,
              image: shared.image,
            });
            const { receipt } = await executeIntent(signer, client, created);
            const registry = getCoordinates("STARKNET").collection721;
            const collectionId = createdCollectionFromReceipt(receipt, registry)?.collectionId;
            if (!collectionId) throw new Error("Collection created, but its id couldn't be read — check My Collections to mint into it.");
            return { collectionId, contract: await createdCollectionAddress(client.provider, registry, collectionId) };
          },
          add: async (destination) => {
            const minted = await client.api.intents.create("mint", {
              owner,
              collectionId: destination.collectionId,
              recipient: owner,
              tokenUri,
              royaltyBps,
            });
            const { receipt } = await executeIntent(signer, client, minted);
            return {
              contract: destination.contract,
              tokenId: destination.contract ? mintedTokenIdFromReceipt(receipt, destination.contract) : null,
            };
          },
        });
        return nftResult(shared, values.name, result.contract, result.tokenId);
      }

      const picked = state.mode === "existing" ? state.existingContract : "";
      const existing = (runtime.resume as string | null) ?? (picked || null);
      const result = await createThenAdd<string, { contract: string; tokenId: string | null }>({
        existing,
        noun: "collection",
        labels,
        onStep,
        create: async () => {
          const created = await client.api.intents.create("create-collection", {
            owner,
            name: shared.draft.name,
            symbol: shared.draft.symbol,
            description: shared.draft.description || undefined,
            image: shared.image,
            baseUri: "",
            service: "mip-erc1155",
          });
          const { receipt } = await executeIntent(signer, client, created);
          const deployed = deployedCollectionFromReceipt(receipt, "mip-erc1155");
          if (!deployed) throw new Error("Collection deployed, but its address couldn't be read — check My Collections to mint into it.");
          return deployed;
        },
        add: async (contract) => {
          const minted = await client.api.intents.create("mint", {
            owner,
            recipient: owner,
            collectionContract: contract,
            tokenUri,
            value: state.editionCount.trim(),
            royaltyBps,
          });
          const { receipt } = await executeIntent(signer, client, minted);
          return { contract, tokenId: mintedTokenIdFromReceipt(receipt, contract) };
        },
      });
      return nftResult(shared, values.name, result.contract, result.tokenId);
    },
  });
}

function nftResult(shared: FormatShared, name: string, contract: string | null, tokenId: string | null): FormatResult {
  return {
    headline: "Asset published",
    detail: "It is recorded onchain with your wallet as owner.",
    name,
    links: assetLinks(contract, tokenId),
    reward: "mint_asset",
    asset: contract && tokenId ? { contract, tokenId, image: shared.image } : undefined,
  };
}

export const SINGLE_FORMAT = makeNftFormat("single");
export const EDITIONS_FORMAT = makeNftFormat("editions");
