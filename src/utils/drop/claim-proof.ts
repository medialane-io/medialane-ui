import { normalizeAddress } from "@medialane/sdk";
import { decodePopClaimFragment } from "@medialane/sdk/starknet";

type ProofStorage = Pick<Storage, "getItem" | "setItem">;

/**
 * The claim proof for `collection`: from the link's fragment when present (and remembered),
 * otherwise the one remembered from an earlier visit — so it survives a sign-in redirect,
 * which keeps only the page path.
 */
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
      // Storage may be unavailable (private mode); the link still works on this visit.
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
