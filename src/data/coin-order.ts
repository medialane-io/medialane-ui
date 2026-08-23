export type CoinPriceSort = "asc" | "desc";

export function orderCoins<T extends { contractAddress: string }>(
  items: T[],
  prices?: Record<string, number | null>,
  priceSort?: CoinPriceSort,
): T[] {
  if (!prices) return items;

  const priced: T[] = [];
  const unpriced: T[] = [];
  for (const item of items) {
    (prices[item.contractAddress] != null ? priced : unpriced).push(item);
  }

  if (priceSort) {
    priced.sort((a, b) => {
      const diff = (prices[a.contractAddress] ?? 0) - (prices[b.contractAddress] ?? 0);
      return priceSort === "asc" ? diff : -diff;
    });
  }

  return [...priced, ...unpriced];
}
