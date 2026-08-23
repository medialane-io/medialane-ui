"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "../utils/cn.js";
import { CoinRow, CoinRowSkeleton, COIN_GRID, type UseCoinPrice } from "./coin-row.js";
import { StatPillRow } from "./stat-tile.js";
import { orderCoins, type CoinPriceSort } from "../data/coin-order.js";
import { coinKind, coinKindLabelPlural, coinServiceIds, COIN_KINDS, type CoinCollectionLike, type CoinKind } from "../data/coins.js";

export type CoinFilter = "all" | CoinKind;
export type CoinSort = "recent" | "name";
export type CoinCounts = Record<string, number>;

export type UseCoins = (opts: { filter: CoinFilter; sort: CoinSort }) => {
  collections: CoinCollectionLike[];
  isLoading: boolean;
  counts?: CoinCounts;
};

export type UsePriceMap = () => { prices: Record<string, number | null>; isLoading: boolean };

export interface CoinsExplorerProps {
  useCoins: UseCoins;
  usePrice: UseCoinPrice;
  usePriceMap?: UsePriceMap;

  coinHref: (collection: CoinCollectionLike) => string;
  heading?: boolean;

  action?: React.ReactNode;
}

const SORT_OPTIONS: { label: string; value: CoinSort }[] = [
  { label: "Recently launched", value: "recent" },
  { label: "Name", value: "name" },
];

const noPriceMap: UsePriceMap = () => ({ prices: {}, isLoading: false });

export function CoinsExplorer({ useCoins, usePrice, usePriceMap, coinHref, heading = true, action }: CoinsExplorerProps) {
  const [filter, setFilter] = useState<CoinFilter>("all");
  const [sort, setSort] = useState<CoinSort>("recent");
  const [query, setQuery] = useState("");
  const [priceSort, setPriceSort] = useState<CoinPriceSort | undefined>(undefined);

  const { collections, isLoading, counts } = useCoins({ filter, sort });
  const { prices } = (usePriceMap ?? noPriceMap)();
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? collections.filter((c) => (c.name ?? "").toLowerCase().includes(q) || (c.symbol ?? "").toLowerCase().includes(q))
      : collections;
    return usePriceMap ? orderCoins(matched, prices, priceSort) : matched;
  }, [collections, query, usePriceMap, prices, priceSort]);

  const showKind = useMemo(() => new Set(items.map((c) => coinKind(c.service))).size > 1, [items]);

  const { statItems, pillFilters } = useMemo(() => {
    if (!counts) return { statItems: [], pillFilters: [] as CoinFilter[] };
    const forKind = (kind: CoinKind) =>
      coinServiceIds(kind).reduce((sum, id) => sum + (counts[id] ?? 0), 0);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const kinds = COIN_KINDS.filter((kind) => forKind(kind) > 0);
    return {
      statItems: [
        { label: total === 1 ? "Coin" : "Coins", value: total },
        ...kinds.map((kind) => ({ label: coinKindLabelPlural(kind), value: forKind(kind) })),
      ],
      pillFilters: ["all", ...kinds] as CoinFilter[],
    };
  }, [counts]);

  const activeIndex = pillFilters.indexOf(filter);

  return (
    <div className="space-y-5">
      {heading && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Creator coins &amp; memecoins</h1>
            <StatPillRow
              items={statItems}
              onSelect={(index) => setFilter(pillFilters[index])}
              activeIndex={activeIndex}
            />
          </div>
          {action}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coins by name or symbol…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as CoinSort)}
          aria-label="Sort coins"
          className="shrink-0 rounded-lg border border-border bg-background px-2.5 py-2 text-xs font-medium text-foreground outline-none focus:border-primary/50"
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <div className={cn(COIN_GRID, "border-b border-border px-2 pb-2 text-2xs font-medium uppercase tracking-wide text-muted-foreground")}>
          <span>Token</span>
          {usePriceMap ? (
            <button
              type="button"
              onClick={() => setPriceSort(priceSort === undefined ? "desc" : priceSort === "desc" ? "asc" : undefined)}
              className={cn("text-right uppercase tracking-wide", priceSort ? "text-foreground" : "text-muted-foreground")}
            >
              Price{priceSort === "desc" ? " ↓" : priceSort === "asc" ? " ↑" : ""}
            </button>
          ) : (
            <span className="text-right">Price</span>
          )}
        </div>

        {isLoading && items.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <CoinRowSkeleton key={i} />)
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {query.trim() ? `No coins match "${query.trim()}".` : "No coins yet."}
          </p>
        ) : (
          items.map((c) => (
            <CoinRow
              key={`${c.chain}-${c.contractAddress}`}
              collection={c}
              usePrice={usePrice}
              href={coinHref(c)}
              showKind={showKind}
            />
          ))
        )}
      </div>
    </div>
  );
}
