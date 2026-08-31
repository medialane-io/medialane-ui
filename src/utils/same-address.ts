import { normalizeAddress } from "@medialane/sdk";

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
