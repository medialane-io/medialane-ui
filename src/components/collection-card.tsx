"use client";

import { useState } from "react";
import Link from "./link.js";
import Image from "./image.js";
import { Loader2, Settings2 } from "lucide-react";
import { cn } from "../utils/cn.js";
import { formatDisplayPrice } from "../utils/format.js";
import { MotionCard } from "./motion-primitives.js";
import { CurrencyIcon } from "./currency-icon.js";
import type { ApiCollection } from "@medialane/sdk";
import { useImageUrl } from "../utils/use-image-url.js";

function parseFloorPrice(floor: string | null | undefined): { amount: string; symbol: string } | null {
  if (!floor) return null;
  const formatted = formatDisplayPrice(floor);
  const parts = formatted.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const symbol = parts[parts.length - 1];
  const amount = parts.slice(0, -1).join(" ");
  return { amount, symbol };
}

export interface CollectionCardProps {
  collection: ApiCollection;

  href?: string;

  settingsHref?: string;
  className?: string;
}

export function CollectionCard({ collection, href, settingsHref, className }: CollectionCardProps) {
  const resolveImage = useImageUrl();
  const [imgError, setImgError] = useState(false);
  const imageUrl = resolveImage(collection.image, { width: 480 });
  const showImage = imageUrl && !imgError;
  const floor = parseFloorPrice(collection.floorPrice);

  return (
    <MotionCard className={cn("card-base group relative", className)}>
      {settingsHref && (
        <Link
          href={settingsHref}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-10 min-h-11 min-w-11 rounded-full flex items-center justify-center"
          aria-label="Collection settings"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60 transition-colors">
            <Settings2 className="h-3.5 w-3.5" />
          </span>
        </Link>
      )}

      <Link href={href ?? `/collections/${collection.contractAddress}`} className="block relative h-full">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
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
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-navy/40" />
          )}

          <div className="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
            {!collection.name && collection.metadataStatus === "PENDING" ? (
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs text-white backdrop-blur-md">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                Indexing…
              </span>
            ) : (
              <p className="max-w-full truncate rounded-full px-3 py-1 text-sm font-bold leading-tight text-white backdrop-blur-md">
                {collection.name ?? "Unnamed Collection"}
              </p>
            )}

            {(collection.totalSupply != null || floor) && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 rounded-full px-2.5 py-1 text-2xs font-medium text-white backdrop-blur-md">
                {collection.totalSupply != null && (
                  <span>
                    {collection.totalSupply.toLocaleString()} {collection.totalSupply === 1 ? "item" : "items"}
                  </span>
                )}
                {floor && (
                  <span className="inline-flex items-center gap-1 font-bold text-white">
                    Floor
                    <CurrencyIcon symbol={floor.symbol} size={10} />
                    {floor.amount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </MotionCard>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 animate-pulse bg-muted" />
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
          <div className="h-4 w-2/3 rounded-md bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-1/3 rounded-md bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
