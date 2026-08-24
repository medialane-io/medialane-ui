"use client";

import { useState } from "react";
import { Search, Plus, Sparkles } from "lucide-react";
import { cn } from "../utils/cn.js";
import { AssetPickerCell, isSameAsset } from "./asset-picker-cell.js";

export interface OwnedAsset {
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string | null;
}

export interface AssetPickerProps {

  assets: OwnedAsset[];
  isLoading: boolean;
  selected: OwnedAsset | null;
  onSelect: (asset: OwnedAsset) => void;

  emptyStateHref?: string;
  emptyStateLabel?: string;
  onMintClick?: () => void;
  className?: string;
}

function MintPromoCard({ onMintClick }: { onMintClick: () => void }) {
  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-brand-purple to-brand-orange">
      <div className="rounded-[15px] bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-purple to-brand-orange flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Mint your first asset</p>
          <p className="text-xs text-muted-foreground mt-0.5">It becomes your avatar and app theme — ready in seconds.</p>
        </div>
        <div className="btn-border-animated shrink-0 p-[1px] rounded-xl">
          <button
            type="button"
            onClick={onMintClick}
            className="h-10 px-4 rounded-[11px] bg-card text-sm font-semibold text-foreground hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Mint an asset
          </button>
        </div>
      </div>
    </div>
  );
}

function MintTile({ onMintClick }: { onMintClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onMintClick}
      className="aspect-square rounded-xl border-2 border-dashed border-brand-purple/40 hover:border-brand-purple/70 hover:bg-brand-purple/5 transition-colors flex flex-col items-center justify-center gap-1 text-brand-purple"
    >
      <Plus className="h-4 w-4" />
      <span className="text-2xs font-semibold">New</span>
    </button>
  );
}

export function AssetPicker({
  assets, isLoading, selected, onSelect, emptyStateHref, emptyStateLabel, onMintClick, className,
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
    if (onMintClick) return <MintPromoCard onMintClick={onMintClick} />;
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
        {onMintClick && !query ? <MintTile onMintClick={onMintClick} /> : null}
      </div>

      {query && filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No assets match &quot;{query}&quot;.</p>
      ) : null}
    </div>
  );
}
