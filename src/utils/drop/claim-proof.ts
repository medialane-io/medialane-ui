import { normalizeAddress } from "@medialane/sdk";
import { decodePopClaimFragment } from "@medialane/sdk/starknet";

type ProofStorage = Pick<Storage, "getItem" | "setItem">;

export function claimProofFor(
  storage: ProofStorage | null,
  collection: string,
  fragment: string,
  keyPrefix = "pop-proof",
): string[] | null {
  const key = `${keyPrefix}:${normalizeAddress("STARKNET", collection)}`;
  const fromLink = decodePopClaimFragment(fragment);
  if (fromLink !== null) {
    try {
      storage?.setItem(key, JSON.stringify(fromLink));
    } catch {
    }
    return fromLink;
  }
  try {
    const saved = storage?.getItem(key);
    const parsed: unknown = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) && parsed.every((p) => typeof p === "string") ? parsed : null;
  } catch {
    return null;
  }
}
