import { normalizeAddress } from "@medialane/sdk";

export function checkIsOwner(
  token: { owner?: string | null; balances?: Array<{ owner: string; amount: string }> | null } | null | undefined,
  walletAddress: string | null | undefined,
  walletBalance?: string | null
): boolean {
  if (!token || !walletAddress) return false;
  const normalizedWallet = normalizeAddress("STARKNET", walletAddress);
  if (token.balances != null && token.balances.length > 0) {
    if (walletBalance != null) return BigInt(walletBalance) > 0n;
    return token.balances.some(
      (b) => normalizeAddress("STARKNET", b.owner) === normalizedWallet && BigInt(b.amount) > 0n
    );
  }
  if (!token.owner) return false;
  return normalizeAddress("STARKNET", token.owner) === normalizedWallet;
}
