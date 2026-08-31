import type { ApiCollection } from "@medialane/sdk";
import { getService } from "@medialane/sdk";

export type MintAssetType = "single" | "editions";

export function mintableCollections(
  assetType: MintAssetType,
  collections: ApiCollection[],
): ApiCollection[] {
  const service = assetType === "single" ? "mip-erc721" : "mip-erc1155";
  return collections.filter((c) => getService(c.service)?.id === service);
}

export function collectionKey(
  assetType: MintAssetType,
): (c: ApiCollection) => string | null | undefined {
  return assetType === "single" ? (c) => c.collectionId : (c) => c.contractAddress;
}
