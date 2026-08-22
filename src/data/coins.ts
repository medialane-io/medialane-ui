

import { formatSmallDecimal } from "../utils/format.js";

export type CoinKind = "creator" | "memecoin";

export interface CoinCollectionLike {
  contractAddress: string;
  chain?: string | null;
  name?: string | null;
  symbol?: string | null;
  image?: string | null;
  service?: string | null;
  claimedBy?: string | null;
  holderCount?: number | null;
  totalSupply?: number | null;
  profile?: { image?: string | null } | null;
}

export interface CoinPriceLike {
  quotePerCoin: number;
  quoteSymbol: string | null;
  /** USD value of one unit of quoteSymbol, when known — lets price
   * displays show a fiat-equivalent alongside the on-chain quote. */
  quoteUsdRate?: number | null;
}

export function coinKind(service: string | null | undefined): CoinKind {
  return service === "external-erc20" ? "memecoin" : "creator";
}

export function formatCoinPrice(n: number): string {
  return formatSmallDecimal(n);
}

const ACCENT_HUES = [220, 258, 341, 23, 325];

export function coinAccentHue(seed: string | null | undefined): number {
  const s = (seed ?? "?").trim().toUpperCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ACCENT_HUES[h % ACCENT_HUES.length];
}

function abbreviate(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
  if (n >= 1_000) return `${(n / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatFdv(
  quotePerCoin: number | null | undefined,
  totalSupply: number | null | undefined,
  quoteSymbol: string | null | undefined
): string | null {
  if (quotePerCoin == null || !totalSupply) return null;
  const sym = quoteSymbol ?? "";
  const abbr = abbreviate(quotePerCoin * totalSupply);
  return sym ? `${abbr} ${sym}` : abbr;
}

export function fdvUsd(price: CoinPriceLike | null, totalSupply: number | null | undefined): number | null {
  if (!price || !totalSupply || totalSupply <= 0 || price.quoteUsdRate == null) return null;
  const v = price.quotePerCoin * totalSupply * price.quoteUsdRate;
  return v > 0 && isFinite(v) ? v : null;
}

export function formatFdvUsd(price: CoinPriceLike | null, totalSupply: number | null | undefined): string | null {
  const v = fdvUsd(price, totalSupply);
  return v == null ? null : `$${abbreviate(v)}`;
}
