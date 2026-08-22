"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "./link.js";
import Image from "./image.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import type { ApiCollection } from "@medialane/sdk";

export interface HeroSliderProps {
  collections: ApiCollection[];
  isLoading: boolean;
  getHref: (collection: ApiCollection) => string;

  placeholderHrefs?: { markets?: string; create?: string };
}

function HeroPlaceholder({ hrefs }: { hrefs: Required<HeroSliderProps>["placeholderHrefs"] }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-brand-blue/20 to-brand-navy/50 flex flex-col items-center justify-center gap-4 text-center px-6 overflow-hidden">

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
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col gap-3">
        <Link href={getHref(collection)} className="hover:opacity-90 transition-opacity">
          <h2 className="text-4xl lg:text-5xl font-semibold text-white leading-tight">{name}</h2>
        </Link>
        <div className="flex items-center gap-4 text-sm text-white/70">
          {supply != null && <span>{supply.toLocaleString()} items</span>}
        </div>
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
              <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 min-h-11 min-w-11 rounded-full flex items-center justify-center transition-colors">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </span>
              </button>
              <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 min-h-11 min-w-11 rounded-full flex items-center justify-center transition-colors">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20">
                  <ChevronRight className="h-5 w-5 text-white" />
                </span>
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
