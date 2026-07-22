"use client";

import Image from "next/image";
import { Check, ImageIcon } from "lucide-react";
import { cn } from "../utils/cn.js";
import type { OwnedAsset } from "./asset-picker.js";

/** Shared grid-cell button — the image/fallback/name/selected-check tile
 *  both `AssetPicker` (my owned assets) and `AssetSearchPicker` (platform
 *  search) render identically. Internal, not exported from the package
 *  root — both callers stay the public API surface. */
export function AssetPickerCell({
  asset, active, onSelect,
}: { asset: OwnedAsset; active: boolean; onSelect: (asset: OwnedAsset) => void }) {
  return (
    <button
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
}

export const isSameAsset = (a: OwnedAsset, b: OwnedAsset | null) =>
  !!b && a.contractAddress === b.contractAddress && a.tokenId === b.tokenId;
