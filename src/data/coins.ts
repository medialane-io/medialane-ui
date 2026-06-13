// Coin discovery — pure, dependency-free helpers + the structural shapes the
// coin components read. No @medialane/sdk import: ui types shared code
// structurally (same pattern as CollectionCard's `ApiCollection & {…}`), so a
// coin on any chain works without bumping ui's SDK. Registry-dependent logic
// (isCoinCollection / COIN_SERVICE_IDS, price reads) lives in the apps and is
// injected — see the CoinsExplorer/CoinCard props.

export type CoinKind = "creator" | "memecoin";

/** The fields a coin tile reads. An app's `ApiCollection` structurally satisfies
 *  this. `chain` is first-class — rendered as a badge; nothing assumes Starknet. */
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

/** Minimal spot-price shape — the concrete read (Ekubo on Starknet, a DEX on
 *  another chain) is injected by the app and structurally satisfies this. */
export interface CoinPriceLike {
  quotePerCoin: number;
  quoteSymbol: string | null;
}

/** Native creator coin vs claimed external memecoin. */
export function coinKind(service: string | null | undefined): CoinKind {
  return service === "external-erc20" ? "memecoin" : "creator";
}

/** Format a quote-per-coin spot price. */
export function formatCoinPrice(n: number): string {
  if (n === 0) return "0";
  if (n < 0.000001) return n.toExponential(2);
  if (n < 1) return n.toPrecision(3);
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

/** Fully-diluted value = price × supply, abbreviated, in the quote symbol.
 *  Returns null when price/supply is unknown or zero (external coins aren't
 *  supply-indexed, so price × 0 must read "—", never "0"). */
export function formatFdv(
  quotePerCoin: number | null | undefined,
  totalSupply: number | null | undefined,
  quoteSymbol: string | null | undefined
): string | null {
  if (quotePerCoin == null || !totalSupply) return null;
  const fdv = quotePerCoin * totalSupply;
  const sym = quoteSymbol ?? "";
  const abbr =
    fdv >= 1_000_000_000 ? `${(fdv / 1_000_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}B` :
    fdv >= 1_000_000     ? `${(fdv / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M` :
    fdv >= 1_000         ? `${(fdv / 1_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K` :
                           fdv.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return sym ? `${abbr} ${sym}` : abbr;
}
