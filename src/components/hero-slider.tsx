"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import type { ApiCollection } from "@medialane/sdk";

export interface HeroSliderProps {
  collections: ApiCollection[];
  isLoading: boolean;
  getHref: (collection: ApiCollection) => string;
  /** Optional placeholder CTA hrefs — defaults to "/marketplace" and "/create/asset" */
  placeholderHrefs?: { markets?: string; create?: string };
}

function formatFloorPrice(price: string | null | undefined): string {
  if (!price) return "";
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

function HeroPlaceholder({ hrefs }: { hrefs: Required<HeroSliderProps>["placeholderHrefs"] }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-navy/50 flex flex-col items-center justify-center gap-4 text-center px-6 overflow-hidden">
      <div className="absolute aurora-purple w-[600px] h-[600px] opacity-20 -top-24 -left-24" />
      <div className="absolute aurora-blue w-[400px] h-[400px] opacity-15 -bottom-16 -right-16" />
      <h2 className="text-4xl sm:text-6xl font-black gradient-text relative z-10">Medialane</h2>
      <p className="text-muted-foreground text-lg relative z-10 max-w-md">
        New monetization revenues for creative works
      </p>
      <div className="flex gap-3 relative z-10">
        <Link href={hrefs.markets!} className="inline-flex items-center justify-center rounded-[11px] bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all">
          Markets
        </Link>
        <Link href={hrefs.create!} className="inline-flex items-center justify-center rounded-[11px] border border-white/20 bg-background/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all">
          Create
        </Link>
      </div>
    </div>
  );
}

function HeroSlide({ collection, active, getHref }: { collection: ApiCollection; active: boolean; getHref: (col: ApiCollection) => string }) {
  const imageUrl = collection.image ? ipfsToHttp(collection.image) : null;
  const name = collection.name ?? "Collection";
  const floor = collection.floorPrice;
  const supply = collection.totalSupply;

  return (
    <div className={cn("absolute inset-0 transition-opacity duration-700", active ? "opacity-100" : "opacity-0 pointer-events-none")}>
      {imageUrl ? (
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-kenburns absolute inset-0">
            <Image src={imageUrl} alt={name} fill className="object-cover" priority={active} unoptimized />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/40 via-brand-blue/20 to-brand-navy/60" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/30 to-black/0" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col gap-3">
        <h2 className="text-4xl lg:text-5xl font-semibold text-white leading-tight">{name}</h2>
        <div className="flex items-center gap-4 text-sm text-white/70">
          {supply != null && <span>{supply.toLocaleString()} items</span>}
          {floor && <span className="text-white font-semibold">Floor {formatFloorPrice(floor)}</span>}
        </div>
        <Link
          href={getHref(collection)}
          className="self-start mt-2 inline-flex items-center gap-1.5 bg-white text-black hover:bg-white/90 font-semibold px-4 py-2 rounded-[11px] text-sm transition-all active:scale-[0.98]"
        >
          View Collection <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function HeroSliderSkeleton() {
  return <section className="relative w-full h-[78vw] min-h-[420px] max-h-[768px] sm:h-[72vh] sm:max-h-[816px] bg-muted animate-pulse" />;
}

export function HeroSlider({ collections, isLoading, getHref, placeholderHrefs = {} }: HeroSliderProps) {
  const hrefs = { markets: "/marketplace", create: "/create/asset", ...placeholderHrefs };
  const [current, setCurrent] = useState(0);
  const count = collections.length;

  const next = useCallback(() => { if (count > 1) setCurrent((c) => (c + 1) % count); }, [count]);
  const prev = useCallback(() => { if (count > 1) setCurrent((c) => (c - 1 + count) % count); }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [count, next]);

  if (isLoading) return <HeroSliderSkeleton />;

  return (
    <section className="relative w-full h-[78vw] min-h-[420px] max-h-[768px] sm:h-[72vh] sm:max-h-[816px] overflow-hidden bg-muted">
      {count === 0 ? (
        <HeroPlaceholder hrefs={hrefs} />
      ) : (
        <>
          {collections.map((col, i) => (
            <HeroSlide key={col.contractAddress} collection={col} active={i === current} getHref={getHref} />
          ))}
          {count > 1 && (
            <>
              <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center transition-colors">
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {collections.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`} className={cn("h-1.5 rounded-full transition-all", i === current ? "w-6 bg-white" : "w-1.5 bg-white/40")} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
