import { normalizeAddress } from "@medialane/sdk";

/**
 * Whether two Starknet addresses are the same account.
 *
 * Addresses are felts, so the same account has several valid spellings that
 * differ by leading zeros: the indexer stores 0x036a8f…, a wallet may report
 * 0x36a8f…. Comparing the strings says they are different accounts, which turns
 * "this listing is mine" into "this listing is someone else's" and offers the
 * owner a Buy button for their own order.
 */
export function isSameAddress(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  try {
    return normalizeAddress("STARKNET", a) === normalizeAddress("STARKNET", b);
  } catch {
    return a.toLowerCase() === b.toLowerCase();
  }
}
