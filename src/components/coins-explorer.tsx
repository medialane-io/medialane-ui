"use client";

import { useState, useMemo, useEffect } from "react";
import { Coins, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "../utils/cn.js";
import { CoinRow, CoinRowSkeleton, COIN_GRID, type UseCoinPrice } from "./coin-row.js";
import { coinKind, type CoinCollectionLike } from "../data/coins.js";

export type CoinFilter = "all" | "creator" | "memecoin";
export type CoinSort = "recent" | "name";
export type UseCoins = (opts: { filter: CoinFilter; sort: CoinSort }) => {
  collections: CoinCollectionLike[];
  isLoading: boolean;
};

export interface CoinsExplorerProps {
  useCoins: UseCoins;
  usePrice: UseCoinPrice;

  coinHref: (collection: CoinCollectionLike) => string;
  heading?: boolean;
}

const FILTER_TABS: { label: string; value: CoinFilter }[] = [
  { label: "All", value: "all" },
  { label: "Creator Coins", value: "creator" },
  { label: "Memecoins", value: "memecoin" },
];

const SORT_OPTIONS: { label: string; value: CoinSort }[] = [
  { label: "Recently launched", value: "recent" },
  { label: "Name", value: "name" },
];

const filterLabel = (v: CoinFilter) => FILTER_TABS.find((t) => t.value === v)?.label ?? "";
const sortLabel = (v: CoinSort) => SORT_OPTIONS.find((o) => o.value === v)?.label ?? "";

export function CoinsExplorer({ useCoins, usePrice, coinHref, heading = true }: CoinsExplorerProps) {
  const [filter, setFilter] = useState<CoinFilter>("all");
  const [sort, setSort] = useState<CoinSort>("recent");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterCount = (filter !== "all" ? 1 : 0) + (sort !== "recent" ? 1 : 0);

  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

  const { collections, isLoading } = useCoins({ filter, sort });
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) => (c.name ?? "").toLowerCase().includes(q) || (c.symbol ?? "").toLowerCase().includes(q)
    );
  }, [collections, query]);

  const showKind = useMemo(() => new Set(items.map((c) => coinKind(c.service))).size > 1, [items]);

  return (
    <div className="space-y-5">
      {heading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-semibold">Coins</span>
          </div>
          <h1 className="text-3xl">Creator coins &amp; memecoins</h1>
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
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary/50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {filterCount > 0 && (
            <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-semibold text-primary-foreground">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {filterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filter !== "all" && <Chip onClear={() => setFilter("all")}>{filterLabel(filter)}</Chip>}
          {sort !== "recent" && <Chip onClear={() => setSort("recent")}>{sortLabel(sort)}</Chip>}
        </div>
      )}

      <div>
        <div className={cn(COIN_GRID, "border-b border-border px-2 pb-2 text-2xs font-medium uppercase tracking-wide text-muted-foreground")}>
          <span>Token</span>
          <span className="text-right">Price</span>
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

      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="relative z-10 w-full max-w-sm space-y-5 overflow-hidden rounded-[calc(var(--radius)*1.25)] bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filters
              </h2>
              {filterCount > 0 && (
                <button
                  onClick={() => { setFilter("all"); setSort("recent"); }}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
            </div>

            <FilterGroup label="Type">
              {FILTER_TABS.map(({ label, value }) => (
                <PillButton key={value} active={filter === value} onClick={() => setFilter(value)}>{label}</PillButton>
              ))}
            </FilterGroup>

            <FilterGroup label="Sort">
              {SORT_OPTIONS.map(({ label, value }) => (
                <PillButton key={value} active={sort === value} onClick={() => setSort(value)}>{label}</PillButton>
              ))}
            </FilterGroup>

            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple py-2.5 text-sm font-semibold text-white"
            >
              Show {items.length} {items.length === 1 ? "coin" : "coins"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-2xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function PillButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {children}
      <button onClick={onClear} aria-label="Clear filter" className="hover:text-primary/60">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
