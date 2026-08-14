import { normalizeAddress, type Chain } from "@medialane/sdk";

export const LIVING_RENDER_COLLECTIONS: Partial<Record<Chain, string[]>> = {
  STARKNET: [
    "0x5ebd2e7ca95af6a81863e89496ba2ca0b3765bd04227bde4b769afbc13e5784",
    "0x1259a8b553e5ae806620ff422eb85ccbce2b8ff034235e8d09e36060058f64e",
  ],
};

export function isLivingRenderCollection(chain: Chain, contractAddress: string): boolean {
  const listed = LIVING_RENDER_COLLECTIONS[chain];
  if (!listed || listed.length === 0) return false;
  const normalized = normalizeAddress(chain, contractAddress);
  return listed.some((addr) => normalizeAddress(chain, addr) === normalized);
}
