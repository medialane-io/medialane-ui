"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Settings2 } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice } from "../utils/format.js";
import { MotionCard } from "./motion-primitives.js";
import { CurrencyIcon } from "./currency-icon.js";
import type { ApiCollection } from "@medialane/sdk";

/** "0.990000 USDC" → { amount: "0.99", symbol: "USDC" } */
function parseFloorPrice(floor: string | null | undefined): { amount: string; symbol: string } | null {
  if (!floor) return null;
  const formatted = formatDisplayPrice(floor);
  const parts = formatted.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const symbol = parts[parts.length - 1];
  const amount = parts.slice(0, -1).join(" ");
  return { amount, symbol };
}

/** ui's pinned SDK lags the apps — extend structurally for newer fields. */
type CollectionWithProfile = ApiCollection & {
  profile?: { hasGatedContent?: boolean } | null;
};

export interface CollectionCardProps {
  collection: ApiCollection;
  /** Override the card link destination. Defaults to /collections/:contractAddress. */
  href?: string;
  /** Shows settings gear icon linking to this path — used in portfolio pages */
  settingsHref?: string;
  className?: string;
}

export function CollectionCard({ collection, href, settingsHref, className }: CollectionCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = collection.image ? ipfsToHttp(collection.image) : null;
  const showImage = imageUrl && !imgError;
  const initial = (collection.name ?? collection.contractAddress).charAt(0).toUpperCase();
  const floor = parseFloorPrice(collection.floorPrice);
  const hasExclusiveContent = !!(collection as CollectionWithProfile).profile?.hasGatedContent;

  return (
    <div className={cn(hasExclusiveContent && "card-exclusive-wrapper btn-border-animated")}>
      <MotionCard className={cn("card-base group relative", className)}>
        {settingsHref && (
          <Link
            href={settingsHref}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
            aria-label="Collection settings"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Link>
        )}

        <Link href={href ?? `/collections/${collection.contractAddress}`} className="block relative h-full">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
            {showImage ? (
              <Image
                src={imageUrl}
                alt={collection.name ?? "Collection"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-navy/40 flex items-center justify-center">
                <span className="text-8xl font-black text-white/10 select-none tracking-tighter">
                  {initial}
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex flex-col gap-1.5 items-start">
              {!collection.name && collection.metadataStatus === "PENDING" ? (
                <span className="flex items-center gap-1 text-[10px] text-white/60 backdrop-blur-md bg-black/30 rounded-full px-2 py-0.5">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Indexing…
                </span>
              ) : (
                <p
                  className="font-bold text-sm text-white leading-tight backdrop-blur-md bg-black/30 rounded-lg px-2.5 py-1 max-w-full truncate"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
                >
                  {collection.name ?? "Unnamed Collection"}
                </p>
              )}

              <div className="flex items-center gap-1.5 flex-wrap">
                {collection.totalSupply != null && (
                  <span className="text-[10px] font-medium text-white/80 backdrop-blur-md bg-black/30 rounded-full px-2 py-0.5">
                    {collection.totalSupply.toLocaleString()} items
                  </span>
                )}
                {floor && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/90 backdrop-blur-md bg-black/30 rounded-full px-2 py-0.5">
                    Floor
                    <CurrencyIcon symbol={floor.symbol} size={10} />
                    {floor.amount}
                  </span>
                )}
                {hasExclusiveContent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white backdrop-blur-md bg-black/50 rounded-full px-2 py-0.5">
                    ✦ Exclusive
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </MotionCard>
    </div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 animate-pulse bg-muted" />
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
          <div className="h-4 w-2/3 rounded-md bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-1/3 rounded-md bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
