"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, ImageIcon, Loader2, Search } from "lucide-react";
import { cn } from "../utils/cn.js";
import type { OwnedAsset } from "./asset-picker.js";

export interface AssetSearchPickerProps {
  /** App-supplied search — the app owns the actual fetch (e.g. GET /v1/search).
   *  Called only when the query is 2+ chars, debounced by this component. */
  search: (query: string) => Promise<OwnedAsset[]>;
  selected: OwnedAsset | null;
  onSelect: (asset: OwnedAsset) => void;
  placeholder?: string;
  className?: string;
}

const isSame = (a: OwnedAsset, b: OwnedAsset | null) =>
  !!b && a.contractAddress === b.contractAddress && a.tokenId === b.tokenId;

export function AssetSearchPicker({
  search, selected, onSelect, placeholder = "Search for an asset or creator", className,
}: AssetSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OwnedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    const timer = setTimeout(() => {
      search(q)
        .then((assets) => {
          if (!cancelled) {
            setResults(assets);
            setHasSearched(true);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, search]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple/40"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Keep typing — 2+ characters to search.</p>
      ) : null}

      {results.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-0.5">
          {results.map((asset) => {
            const active = isSame(asset, selected);
            return (
              <button
                key={`${asset.contractAddress}-${asset.tokenId}`}
                type="button"
                onClick={() => onSelect(asset)}
                aria-pressed={active}
                className={cn(
                  "group relative aspect-square rounded-xl overflow-hidden border-2 transition-colors text-left",
                  active ? "border-brand-purple" : "border-border/50 active:border-border sm:hover:border-border",
                )}
              >
                {asset.image ? (
                  <Image src={asset.image} alt={asset.name} fill sizes="120px" className="object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted/60">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                  <p className="truncate text-[11px] font-medium text-white">{asset.name}</p>
                </div>
                {active ? (
                  <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-brand-purple flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : hasSearched && !isLoading ? (
        <p className="text-xs text-muted-foreground text-center py-4">No assets match &quot;{query.trim()}&quot;.</p>
      ) : null}
    </div>
  );
}
