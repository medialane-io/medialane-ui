"use client";

/**
 * CoinsExplorer — the shared coin-discovery surface (chain-agnostic).
 *
 * Owns view/search/filter/sort UI only. The data source (`useCoins`), the price
 * read (`usePrice`), and the link target (`coinHref`) are injected, so each app
 * (and each chain) wires its own without forking this component.
 */

import { useState, useMemo } from "react";
import { Coins, LayoutGrid, List, Search } from "lucide-react";
import { cn } from "../utils/cn.js";
import { CoinCard, CoinRow, CoinCardSkeleton, type UseCoinPrice } from "./coin-card.js";
import type { CoinCollectionLike } from "../data/coins.js";

export type CoinFilter = "all" | "creator" | "memecoin";
export type CoinSort = "recent" | "name";
export type UseCoins = (opts: { filter: CoinFilter; sort: CoinSort }) => {
  collections: CoinCollectionLike[];
  isLoading: boolean;
};

export interface CoinsExplorerProps {
  useCoins: UseCoins;
  usePrice: UseCoinPrice;
  /** Build the link target for a coin (internal or per-chain trading app). */
  coinHref: (collection: CoinCollectionLike) => string;
  heading?: boolean;
}

const FILTER_TABS: { label: string; value: CoinFilter }[] = [
  { label: "All", value: "all" },
  { label: "Creator Coins", value: "creator" },
  { label: "Memecoins", value: "memecoin" },
];

// Recency default — never raw swap volume (05 §11 anti-wash hygiene).
const SORT_OPTIONS: { label: string; value: CoinSort }[] = [
  { label: "Recently launched", value: "recent" },
  { label: "Name", value: "name" },
];

export function CoinsExplorer({ useCoins, usePrice, coinHref, heading = true }: CoinsExplorerProps) {
  const [filter, setFilter] = useState<CoinFilter>("all");
  const [sort, setSort] = useState<CoinSort>("recent");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");

  const { collections, isLoading } = useCoins({ filter, sort });
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) => (c.name ?? "").toLowerCase().includes(q) || (c.symbol ?? "").toLowerCase().includes(q)
    );
  }, [collections, query]);

  return (
    <div className="space-y-6">
      {heading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Tokens</span>
          </div>
          <h1 className="text-3xl font-bold">Creator coins &amp; memecoins</h1>
          <p className="text-muted-foreground">Discover creator-issued social tokens and claimed memecoins.</p>
        </div>
      )}

      <div className="space-y-3 border-b border-border/60 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {FILTER_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as CoinSort)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="inline-flex rounded-lg border border-border p-0.5">
              {([{ v: "grid", Icon: LayoutGrid }, { v: "table", Icon: List }] as const).map(({ v, Icon }) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  aria-label={v === "grid" ? "Grid view" : "Table view"}
                  className={cn("rounded-md p-1.5 transition-colors", view === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coins by name or symbol…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <CoinCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border/60 py-16 text-center text-muted-foreground">
          {query.trim() ? `No coins match "${query.trim()}".` : "No coins yet."}
        </div>
      ) : view === "table" ? (
        <div className="space-y-2">
          {items.map((c) => <CoinRow key={`${c.chain}-${c.contractAddress}`} collection={c} usePrice={usePrice} href={coinHref(c)} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((c) => <CoinCard key={`${c.chain}-${c.contractAddress}`} collection={c} usePrice={usePrice} href={coinHref(c)} />)}
        </div>
      )}
    </div>
  );
}
