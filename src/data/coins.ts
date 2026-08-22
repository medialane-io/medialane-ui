

import { getService, listServices, type ServiceDefinition } from "@medialane/sdk";
import { formatSmallDecimal } from "../utils/format.js";

export type CoinKind = "creator" | "unruggable" | "memecoin";

export interface CoinCollectionLike {
  contractAddress: string;
  chain?: string | null;
  name?: string | null;
  symbol?: string | null;
  image?: string | null;
  service?: string | null;
  claimedBy?: string | null;
  holderCount?: number | null;

  totalSupply?: string | null;
  decimals?: number | null;
  profile?: { image?: string | null } | null;
}

export interface CoinPriceLike {
  quotePerCoin: number;
  quoteSymbol: string | null;
  /** USD value of one unit of quoteSymbol, when known — lets price
   * displays show a fiat-equivalent alongside the on-chain quote. */
  quoteUsdRate?: number | null;
}

const KIND_BY_SERVICE: Record<string, CoinKind> = {
  "creator-coin": "creator",
  "unruggable-erc20": "unruggable",
  "external-erc20": "memecoin",
};

export function coinKind(service: string | null | undefined): CoinKind {
  const def = getService(service);
  return (def && KIND_BY_SERVICE[def.id]) ?? "memecoin";
}

export function coinKindLabel(kind: CoinKind): string {
  return getService(coinServiceIds(kind)[0])?.displayName ?? "Coin";
}

export function isCoinService(def: ServiceDefinition): boolean {
  return def.uiVariant === "coin";
}

export function coinServiceIds(kind: CoinKind): string[] {
  return listServices()
    .filter((s) => isCoinService(s) && KIND_BY_SERVICE[s.id] === kind)
    .map((s) => s.id);
}

export const COIN_KINDS: CoinKind[] = ["creator", "unruggable", "memecoin"];

export function formatCoinPrice(n: number): string {
  return formatSmallDecimal(n);
}

const ACCENT_TOKENS = [
  "bg-brand-rose",
  "bg-brand-maeve",
  "bg-brand-purple",
  "bg-brand-orange",
  "bg-brand-blue",
] as const;

export function coinAccentToken(seed: string | null | undefined): string {
  const s = (seed ?? "?").trim().toUpperCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ACCENT_TOKENS[h % ACCENT_TOKENS.length];
}

function abbreviate(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function coinSupply(collection: CoinCollectionLike): number | null {
  const raw = collection.totalSupply;
  if (raw == null || raw === "") return null;
  let units: bigint;
  try {
    units = BigInt(raw);
  } catch {
    return null;
  }
  if (units <= 0n) return null;
  const supply = Number(units) / 10 ** (collection.decimals ?? 18);

  return isFinite(supply) && supply >= 1 ? supply : null;
}

export function fdvUsd(price: CoinPriceLike | null, collection: CoinCollectionLike): number | null {
  const supply = coinSupply(collection);
  if (!price || supply == null || price.quoteUsdRate == null) return null;
  const v = price.quotePerCoin * supply * price.quoteUsdRate;
  return v > 0 && isFinite(v) ? v : null;
}

export function formatFdvUsd(price: CoinPriceLike | null, collection: CoinCollectionLike): string | null {
  const v = fdvUsd(price, collection);
  return v == null ? null : `$${abbreviate(v)}`;
}
