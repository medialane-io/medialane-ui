import { cairo, type ProviderInterface } from "starknet";
import { getCoordinates } from "@medialane/sdk";

export interface ArchiveTarget {
  collectionId: bigint;
  registry: string;
  archived: boolean;
}

type Reader = Pick<ProviderInterface, "callContract">;

function u256(low: string, high: string): bigint {
  return BigInt(low) + (BigInt(high) << 128n);
}

export async function readArchiveTarget(provider: Reader, contract: string, tokenId: string): Promise<ArchiveTarget | null> {
  try {
    const registry = getCoordinates("STARKNET").collection721;
    const [registryOfToken] = await provider.callContract({ contractAddress: contract, entrypoint: "get_registry", calldata: [] });
    if (BigInt(registryOfToken) !== BigInt(registry)) return null;

    const [low, high] = await provider.callContract({ contractAddress: contract, entrypoint: "get_collection_id", calldata: [] });
    const token = cairo.uint256(BigInt(tokenId));
    const [archived] = await provider.callContract({
      contractAddress: contract,
      entrypoint: "is_archived",
      calldata: [String(token.low), String(token.high)],
    });
    return { collectionId: u256(low, high), registry, archived: BigInt(archived) !== 0n };
  } catch {
    return null;
  }
}
