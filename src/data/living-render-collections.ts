import { normalizeAddress, type Chain } from "@medialane/sdk";

/**
 * Curated allowlist of external collections whose asset media renders as a
 * live on-chain animation (`animation_url`, sandboxed iframe) instead of the
 * static `image` everywhere else. Not protocol coordinates — this is
 * partner-launch curation, deliberately kept out of the SDK
 * (see medialane-core/docs/specs/2026-07-28-gol-starknet-living-render-design.md §7).
 *
 * Empty until gol_starknet (https://github.com/l-henri/gol_starknet) deploys
 * to Starknet mainnet — Sepolia-only as of this file's creation.
 */
export const LIVING_RENDER_COLLECTIONS: Partial<Record<Chain, string[]>> = {
  STARKNET: [
    // TODO(gol_starknet mainnet launch): GolLifeformsV3 ("Digital Bacteria" / BACT)
    // TODO(gol_starknet mainnet launch): GolWanderersV3 ("Digital Wanderers" / WNDR)
  ],
};

export function isLivingRenderCollection(chain: Chain, contractAddress: string): boolean {
  const listed = LIVING_RENDER_COLLECTIONS[chain];
  if (!listed || listed.length === 0) return false;
  const normalized = normalizeAddress(chain, contractAddress);
  return listed.some((addr) => normalizeAddress(chain, addr) === normalized);
}
