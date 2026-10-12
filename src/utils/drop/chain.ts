import { normalizeAddress } from "@medialane/sdk";
import type { ProviderInterface } from "starknet";

export async function erc20Balance(provider: Pick<ProviderInterface, "callContract">, token: string, wallet: string): Promise<bigint> {
  const res = await provider.callContract({
    contractAddress: normalizeAddress("STARKNET", token),
    entrypoint: "balance_of",
    calldata: [normalizeAddress("STARKNET", wallet)],
  });
  return BigInt(res[0] ?? "0x0") + (BigInt(res[1] ?? "0x0") << 128n);
}
