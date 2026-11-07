import { buildAssetMetadata, type ApiCollection } from "@medialane/sdk";
import { executeIntent, deployedCollectionFromReceipt, mintedTokenIdFromReceipt, type MedialaneClient } from "@medialane/sdk/starknet";
import type { IPType } from "../../data/ip.js";
import type { MetadataField } from "../ip-type-fields.js";
import { uploadJsonToIpfs } from "../../utils/ipfs-upload.js";
import type { FormValues } from "./form.js";
import type { FastMintSigner, MediaKind, MintedAsset } from "./types.js";
import type { MintAssetType } from "./mintable-collections.js";

export type MintDestination =
  | { mode: "existing"; collectionId: string; collectionContract: string }
  | { mode: "new"; name: string; symbol: string; description: string };

export interface MintAssetInput {
  client: MedialaneClient;
  signer: FastMintSigner;
  walletAddress: string;
  values: FormValues;
  ipType: IPType;
  templateFields: MetadataField[];
  mediaKind: MediaKind;
  mediaUri: string;
  featureUri: string | null;
  assetType: MintAssetType;
  editionCount: string;
  destination: MintDestination;
  singleCollections: ApiCollection[];
  refetchCollections: () => Promise<ApiCollection[]>;
  getUploadToken: () => Promise<string | null>;
}

async function pollForNewCollection(
  refetchCollections: () => Promise<ApiCollection[]>,
  name: string,
  symbol: string,
): Promise<ApiCollection | null> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const list = await refetchCollections();
    const match = list.find((c) => c.name === name && c.symbol === symbol);
    if (match?.collectionId) return match;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

export async function mintAsset(input: MintAssetInput): Promise<MintedAsset | null> {
  const { client, signer, walletAddress, values, destination } = input;

  const image = input.mediaKind === "image" ? input.mediaUri : input.featureUri!;
  const built = buildAssetMetadata({
    name: values.name,
    description: values.description || "",
    externalUrl: values.external_url || "",
    imageUri: image,
    creator: walletAddress,
    ipType: input.ipType,
    licenseType: values.licenseType,
    commercialUse: values.commercialUse,
    derivatives: values.derivatives,
    attribution: values.attribution,
    geographicScope: values.geographicScope,
    aiPolicy: values.aiPolicy,
    royalty: String(values.royalty),
    templateTraits: input.templateFields
      .filter(({ traitType, value }) => traitType.trim() && value.trim())
      .map(({ traitType, value }) => ({ traitType, value })),
  });
  const metadata: Record<string, unknown> = { ...built };
  if (input.mediaKind !== "image") metadata.animation_url = input.mediaUri;

  const uploadToken = await input.getUploadToken();
  if (!uploadToken) throw new Error("Sign in first");
  const tokenUri = await uploadJsonToIpfs(client.api, metadata);

  const royaltyBps = Math.round(values.royalty * 100);
  let contractAddress: string | null;
  let tokenId: string | null;

  if (input.assetType === "single") {
    let collectionId = destination.mode === "existing" ? destination.collectionId : "";
    contractAddress = destination.mode === "existing"
      ? input.singleCollections.find((c) => c.collectionId === destination.collectionId)?.contractAddress ?? null
      : null;

    if (destination.mode === "new") {
      const created = await client.api.intents.create("create-collection", {
        owner: walletAddress,
        name: destination.name,
        symbol: destination.symbol,
        description: destination.description || undefined,
        image,
      });
      await executeIntent(signer, client, created);

      const found = await pollForNewCollection(input.refetchCollections, destination.name, destination.symbol);
      if (!found) throw new Error("Collection created, but it's still indexing — try minting again in a moment from My Collections.");
      collectionId = found.collectionId!;
      contractAddress = found.contractAddress ?? null;
    }

    const minted = await client.api.intents.create("mint", {
      owner: walletAddress,
      collectionId,
      recipient: walletAddress,
      tokenUri,
      royaltyBps,
    });
    const result = await executeIntent(signer, client, minted);
    tokenId = contractAddress ? mintedTokenIdFromReceipt(result.receipt, contractAddress) : null;
  } else {
    let collectionContract = destination.mode === "existing" ? destination.collectionContract : "";

    if (destination.mode === "new") {
      const created = await client.api.intents.create("create-collection", {
        owner: walletAddress,
        name: destination.name,
        symbol: destination.symbol,
        description: destination.description || undefined,
        image,
        baseUri: "",
        service: "mip-erc1155",
      });
      const deployResult = await executeIntent(signer, client, created);

      const deployed = deployedCollectionFromReceipt(deployResult.receipt, "mip-erc1155");
      if (!deployed) throw new Error("Collection deployed, but its address couldn't be read — check My Collections to mint into it.");
      collectionContract = deployed;
    }

    const minted = await client.api.intents.create("mint", {
      owner: walletAddress,
      recipient: walletAddress,
      collectionContract,
      tokenUri,
      value: input.editionCount,
      royaltyBps,
    });
    const result = await executeIntent(signer, client, minted);
    contractAddress = collectionContract;
    tokenId = mintedTokenIdFromReceipt(result.receipt, collectionContract);
  }

  return contractAddress && tokenId ? { contract: contractAddress, tokenId, image } : null;
}
