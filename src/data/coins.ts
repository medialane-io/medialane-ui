

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
}

export function coinKind(service: string | null | undefined): CoinKind {
  return service === "external-erc20" ? "memecoin" : "creator";
}

export function formatCoinPrice(n: number): string {
  if (n === 0) return "0";
  if (n < 0.000001) return n.toExponential(2);
  if (n < 1) return n.toPrecision(3);
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

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
