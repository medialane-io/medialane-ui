import { normalizeAddress, type Chain } from "@medialane/sdk";

/**
 * Curated allowlist of external collections whose asset media renders as a
 * live on-chain animation (`animation_url`, sandboxed iframe) instead of the
 * static `image` everywhere else. Not protocol coordinates — this is
 * partner-launch curation, deliberately kept out of the SDK
 * (see medialane-core/docs/specs/2026-07-28-gol-starknet-living-render-design.md §7).
 *
 * gol_starknet (https://github.com/l-henri/gol_starknet) deployed to
 * Starknet mainnet 2026-07-31 — see medialane-core/docs/mainnet-deployment
 * record mirrored from that repo's docs/mainnet-deployment.md.
 */
export const LIVING_RENDER_COLLECTIONS: Partial<Record<Chain, string[]>> = {
  STARKNET: [
    "0x5ebd2e7ca95af6a81863e89496ba2ca0b3765bd04227bde4b769afbc13e5784", // GolLifeformsV3 ("Digital Bacteria" / BACT)
    "0x1259a8b553e5ae806620ff422eb85ccbce2b8ff034235e8d09e36060058f64e", // GolWanderersV3 ("Digital Wanderers" / WNDR)
  ],
};

export function isLivingRenderCollection(chain: Chain, contractAddress: string): boolean {
  const listed = LIVING_RENDER_COLLECTIONS[chain];
  if (!listed || listed.length === 0) return false;
  const normalized = normalizeAddress(chain, contractAddress);
  return listed.some((addr) => normalizeAddress(chain, addr) === normalized);
}
