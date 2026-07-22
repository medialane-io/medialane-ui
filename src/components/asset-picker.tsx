"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "../utils/cn.js";
import { AssetPickerCell, isSameAsset } from "./asset-picker-cell.js";

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
        {filtered.map((asset) => (
          <AssetPickerCell
            key={`${asset.contractAddress}-${asset.tokenId}`}
            asset={asset}
            active={isSameAsset(asset, selected)}
            onSelect={onSelect}
          />
        ))}
      </div>

      {query && filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No assets match &quot;{query}&quot;.</p>
      ) : null}
    </div>
  );
}
