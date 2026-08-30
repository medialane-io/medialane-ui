import type { ApiCollection } from "@medialane/sdk";
import { getService } from "@medialane/sdk";

export type MintAssetType = "single" | "editions";

/**
 * Collections a creator can actually mint into, for the chosen asset type.
 *
 * Only collections a Medialane factory deployed qualify. An external ERC1155 a
 * creator happens to own cannot be minted into here, and offering it produces a
 * mint that is rejected downstream rather than an explanation up front.
 */
export function mintableCollections(
  assetType: MintAssetType,
  collections: ApiCollection[],
): ApiCollection[] {
  const service = assetType === "single" ? "mip-erc721" : "mip-erc1155";
  return collections.filter((c) => getService(c.service)?.id === service);
}

/**
 * The field identifying a collection for the chosen asset type. ERC1155
 * collections carry no collectionId, so limited editions are keyed by contract
 * address; reading the wrong field yields null and looks like "nothing chosen".
 */
export function collectionKey(
  assetType: MintAssetType,
): (c: ApiCollection) => string | null | undefined {
  return assetType === "single" ? (c) => c.collectionId : (c) => c.contractAddress;
}
