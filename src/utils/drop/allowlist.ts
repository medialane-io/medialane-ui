import { normalizeAddress } from "@medialane/sdk";

const STARKNET_ADDRESS_BOUND = 2n ** 251n;

export interface ParsedAllowlist {
  addresses: string[];
  invalid: string[];
  duplicates: string[];
}

export function parseAllowlist(raw: string): ParsedAllowlist {
  const out: ParsedAllowlist = { addresses: [], invalid: [], duplicates: [] };
  const seen = new Set<string>();
  for (const entry of raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)) {
    if (/^address$/i.test(entry)) continue;
    const valid = /^0x[0-9a-fA-F]{1,64}$/.test(entry) && BigInt(entry) !== 0n && BigInt(entry) < STARKNET_ADDRESS_BOUND;
    if (!valid) {
      out.invalid.push(entry);
      continue;
    }
    const address = normalizeAddress("STARKNET", entry);
    if (seen.has(address)) {
      out.duplicates.push(entry);
      continue;
    }
    seen.add(address);
    out.addresses.push(address);
  }
  return out;
}
