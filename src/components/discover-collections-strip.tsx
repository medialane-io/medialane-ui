"use client";

import { useState } from "react";
import { Layers, ArrowRight } from "lucide-react";
import { FadeIn } from "./motion-primitives.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice } from "../utils/format.js";
import type { ApiCollection } from "@medialane/sdk";

export interface DiscoverCollectionsStripProps {
  collections: ApiCollection[];
  isLoading: boolean;
  getHref: (collection: ApiCollection) => string;
  allCollectionsHref?: string;
  sectionLabel?: string;
  title?: string;
}

function CollectionChipSkeleton() {
  return (
    <div className="shrink-0 w-80 rounded-xl border border-border overflow-hidden">
      <div className="aspect-square w-full bg-muted animate-pulse" />
      <div className="p-3 space-y-1.5">
        <div className="h-3.5 w-28 bg-muted animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

function CollectionChip({
  collection,
  href,
}: {
  collection: ApiCollection;
  href: string;
}) {
  const [imgError, setImgError] = useState(false);
  const image = collection.image && !imgError ? ipfsToHttp(collection.image) : null;
  const initial = (collection.name ?? "?").charAt(0).toUpperCase();

  return (
    <a
      href={href}
      className="block shrink-0 w-80 snap-start active:scale-[0.97] transition-transform duration-150"
    >
      <div className="rounded-xl border border-border overflow-hidden group bg-card hover:border-border/80 transition-colors">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={collection.name ?? ""}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-navy/40 flex items-center justify-center">
              <span className="text-5xl font-black text-white/10 select-none">{initial}</span>
            </div>
          )}
        </div>
        <div className="p-3 space-y-0.5">
          <p className="text-sm font-semibold truncate">{collection.name ?? "Unnamed"}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{collection.totalSupply ?? 0} items</span>
            {collection.floorPrice && (
              <span className="font-semibold text-brand-orange">
                {formatDisplayPrice(collection.floorPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export function DiscoverCollectionsStrip({
  collections,
  isLoading,
  getHref,
  allCollectionsHref = "/collections",
  sectionLabel = "NFT",
  title = "Collections",
}: DiscoverCollectionsStripProps) {
  return (
    <FadeIn>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label">{sectionLabel}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Layers className="h-4 w-4 text-brand-blue" />
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
          </div>
          <a
            href={allCollectionsHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-3 w-max pb-1">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CollectionChipSkeleton key={i} />)
              : collections.map((col) => (
                  <CollectionChip key={col.contractAddress} collection={col} href={getHref(col)} />
                ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
