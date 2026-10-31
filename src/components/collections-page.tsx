"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Layers, Eye, SlidersHorizontal, Award, Package, ArrowDownUp, Search, X } from "lucide-react";
import { Button } from "./button.js";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { HelpIcon } from "./help-icon.js";
import { Input } from "./input.js";
import { ResultThumbnail } from "./result-thumbnail.js";
import Link from "./link.js";
import { useRouter } from "./router.js";
import { PageContainer } from "./page-container.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { cn } from "../utils/cn.js";
import { useCollections, type CollectionSort } from "../utils/use-collections.js";
import { useMedialaneClient } from "../utils/use-medialane-client.js";
import { SEARCH_MIN_LENGTH, useSearch } from "../utils/use-search.js";
import { collectionHref, type ApiCollection } from "@medialane/sdk";

const PAGE_SIZE = 24;

const SORT_OPTIONS: { label: string; value: CollectionSort }[] = [
  { label: "Recent",      value: "recent"  },
  { label: "Most assets", value: "supply"  },
  { label: "Top volume",  value: "volume"  },
  { label: "Floor ↑",    value: "floor"   },
  { label: "A → Z",      value: "name"    },
];

const SERVICE_TABS = [
  { label: "All",        value: undefined    },
  { label: "POP Events", value: "pop-protocol" },
  { label: "Drops",      value: "drop-collection" },
] as const;

function useStandardCounts() {
  const client = useMedialaneClient();
  const { data } = useSWR(
    "collection-standard-counts",
    async () => {
      const [single, multi] = await Promise.all(
        ["ERC721", "ERC1155"].map((standard) =>
          client.api.collections.list({ standard, hideEmpty: true, limit: 1 })
        )
      );
      return { single: single.meta?.total, multi: multi.meta?.total };
    },
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
  return data ?? null;
}

function CollectionSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results } = useSearch(query, { limit: 6 });
  const matches = results?.collections ?? [];

  useEffect(() => {
    const timer = setTimeout(() => setQuery(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const clear = () => {
    setValue("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative w-full sm:max-w-sm sm:flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-9 pl-9 pr-9 text-sm"
        placeholder="Search collections"
        aria-label="Search collections"
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim().length >= SEARCH_MIN_LENGTH) {
            router.push(`/search?q=${encodeURIComponent(value.trim())}`);
          }
        }}
      />
      {value && (
        <button
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={clear}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {open && matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {matches.map((col) => {
            const label = col.name ?? "Untitled";
            return (
              <Link
                key={col.contractAddress}
                href={collectionHref("STARKNET", col.contractAddress)}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <ResultThumbnail src={col.image} label={label} />
                <span className="truncate text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CollectionsPage() {
  const counts = useStandardCounts();
  const [sort, setSort]           = useState<CollectionSort>("recent");
  const [hideEmpty, setHideEmpty] = useState(true);
  const [service, setService]     = useState<string | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage]           = useState(1);
  const [allCollections, setAllCollections] = useState<ApiCollection[]>([]);

  const { collections, meta, isLoading } = useCollections(
    page,
    PAGE_SIZE,
    undefined,
    sort,
    service === "pop-protocol" || service === "drop-collection" ? false : hideEmpty,
    service,
    "ERC721,ERC1155"
  );

  const { collections: featuredCollections, isLoading: featuredLoading } = useCollections(
    1,
    8,
    true,
    "recent",
    true,
    undefined,
    "ERC721,ERC1155"
  );

  const prevFilters = useRef({ sort, hideEmpty, service });
  useEffect(() => {
    const f = prevFilters.current;
    if (f.sort !== sort || f.hideEmpty !== hideEmpty || f.service !== service) {
      prevFilters.current = { sort, hideEmpty, service };
      setPage(1);
      setAllCollections([]);
    }
  }, [sort, hideEmpty, service]);

  useEffect(() => {
    if (isLoading || collections.length === 0) return;
    setAllCollections((prev) => {
      const ids = new Set(prev.map((c) => c.contractAddress));
      const next = collections.filter((c) => !ids.has(c.contractAddress));
      return page === 1 ? collections : [...prev, ...next];
    });
  }, [collections, isLoading, page]);

  const hasMore = meta?.total != null ? allCollections.length < meta.total : false;
  const isInitialLoading = isLoading && allCollections.length === 0;

  const activeFilters = [!hideEmpty].filter(Boolean).length;

  const resetAll = () => {
    setHideEmpty(true);
  };

  const handleServiceChange = (val: string | undefined) => {
    setService(val);
  };

  return (
    <PageContainer className="box-border max-w-full pt-14 pb-8 space-y-8">

      <div className="space-y-2 pt-8">

        <h1 className="text-3xl font-bold">Onchain Collections</h1>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {counts?.single != null && counts.multi != null && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm">
              <span className="font-bold tabular-nums">{(counts.single + counts.multi).toLocaleString()}</span>
              <span className="text-muted-foreground">Collections</span>
            </div>
          )}
          {counts?.multi != null && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm">
              <span className="font-bold tabular-nums">{counts.multi.toLocaleString()}</span>
              <span className="text-muted-foreground">Multi editions</span>
            </div>
          )}
        </div>
      </div>

      {(featuredLoading || featuredCollections.length > 0) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredLoading
            ? Array.from({ length: 8 }).map((_, i) => <CollectionCardSkeleton key={i} />)
            : featuredCollections.map((col) => (
                <CollectionCard key={col.contractAddress} collection={col} />
              ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <CollectionSearch />
          <div className="flex items-center gap-2 sm:ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as CollectionSort)}>
              <SelectTrigger className="h-9 w-auto gap-1.5 text-xs" aria-label="Sort collections">
                <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => setFiltersOpen(true)}
              className={cn(
                "relative flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors",
                activeFilters > 0 || service !== undefined
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {(activeFilters > 0 || service !== undefined) && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-2xs font-bold text-primary-foreground">
                  {activeFilters + (service !== undefined ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        {(service !== undefined || !hideEmpty) && (
          <div className="flex flex-wrap items-center gap-2">
            {service !== undefined && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary">
                {service === "drop-collection" ? <Package className="h-3 w-3" /> : <Award className="h-3 w-3" />}
                {SERVICE_TABS.find((t) => t.value === service)?.label}
                <button onClick={() => setService(undefined)} className="ml-0.5 hover:text-primary/60" aria-label="Remove source filter">×</button>
              </span>
            )}
            {!hideEmpty && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary">
                Show empty
                <button onClick={() => setHideEmpty(true)} className="ml-0.5 hover:text-primary/60" aria-label="Remove show empty filter">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md p-0 overflow-hidden gap-0 flex flex-col max-h-[85svh]">

          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 pr-12">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
            </DialogTitle>
            {(activeFilters > 0 || service !== undefined) && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { resetAll(); setService(undefined); }}>
                Clear all
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            <div className="space-y-2">
              <p className="text-2xs font-semibold text-muted-foreground">Source</p>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_TABS.map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => handleServiceChange(value)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                      service === value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {value === "pop-protocol" && <Award className="h-3 w-3" />}
                    {value === "drop-collection" && <Package className="h-3 w-3" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-2xs font-semibold text-muted-foreground">Show</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHideEmpty((v) => !v)}
                    className={cn(
                      "flex flex-1 items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors text-left",
                      !hideEmpty
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    <Eye className="h-4 w-4 shrink-0" />
                    Show empty collections
                  </button>
                  <HelpIcon content="Include collections with no minted assets yet — hidden by default to keep the feed clean" side="left" />
                </div>
              </div>
            </div>

          </div>

          <div className="px-5 py-3 border-t border-border/60">
            <Button className="w-full" onClick={() => setFiltersOpen(false)}>
              Show results
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {isInitialLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CollectionCardSkeleton key={i} />)}
        </div>
      ) : allCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Layers className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-2xl font-bold">No collections found</p>
          <p className="text-muted-foreground max-w-sm">
            {hideEmpty
              ? "No collections with assets yet."
              : "Deploy the first collection on Medialane."}
          </p>
          {activeFilters > 0 && (
            <Button variant="outline" size="sm" onClick={resetAll}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {allCollections.map((col) => (
              <CollectionCard key={col.contractAddress} collection={col} />
            ))}
          </div>

          <LoadMoreSentinel
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={() => setPage((p) => p + 1)}
          />
        </div>
      )}
    </PageContainer>
  );
}
