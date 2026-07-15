"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ImageIcon, Search } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface OwnedAsset {
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string | null;
}

export interface AssetPickerProps {
  /** The caller's already-fetched, already-resolved asset list — this
   *  component takes data, it doesn't fetch it. Plug in `useTokensByOwner`
   *  (or an app's equivalent) and map to `OwnedAsset` at the call site. */
  assets: OwnedAsset[];
  isLoading: boolean;
  selected: OwnedAsset | null;
  onSelect: (asset: OwnedAsset) => void;
  /** Shown in the empty state when the wallet owns nothing yet. */
  emptyStateHref?: string;
  emptyStateLabel?: string;
  className?: string;
}

const isSame = (a: OwnedAsset, b: OwnedAsset | null) =>
  !!b && a.contractAddress === b.contractAddress && a.tokenId === b.tokenId;

export function AssetPicker({
  assets, isLoading, selected, onSelect, emptyStateHref, emptyStateLabel, className,
}: AssetPickerProps) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : assets;

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-3 sm:grid-cols-4 gap-2.5", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted/60 animate-pulse" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground", className)}>
        You don&apos;t own any assets yet.
        {emptyStateHref ? (
          <a href={emptyStateHref} className="ml-1 font-semibold text-foreground underline underline-offset-2">
            {emptyStateLabel ?? "Create one"}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {assets.length > 8 ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your assets"
            className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple/40"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-0.5">
        {filtered.map((asset) => {
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

      {query && filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No assets match &quot;{query}&quot;.</p>
      ) : null}
    </div>
  );
}
