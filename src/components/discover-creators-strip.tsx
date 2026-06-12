"use client";

import { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { FadeIn } from "./motion-primitives.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import type { ApiCreatorProfile } from "@medialane/sdk";

export interface DiscoverCreatorsStripProps {
  creators: ApiCreatorProfile[];
  isLoading: boolean;
  getHref: (creator: ApiCreatorProfile) => string;
  allCreatorsHref?: string;
  sectionLabel?: string;
  title?: string;
}

function CreatorChipSkeleton() {
  return (
    <div className="shrink-0 w-64 aspect-[3/4] rounded-xl bg-muted animate-pulse" />
  );
}

function CreatorChip({
  creator,
  href,
}: {
  creator: ApiCreatorProfile;
  href: string;
}) {
  const [bannerError, setBannerError] = useState(false);

  // bannerImage with collectionImage fallback — io-approved big-username design
  const rawSrc =
    creator.bannerImage ||
    (creator as ApiCreatorProfile & { collectionImage?: string | null }).collectionImage ||
    null;
  const bannerUrl = rawSrc && !bannerError ? ipfsToHttp(rawSrc) : null;

  return (
    <a
      href={href}
      className="block shrink-0 w-64 snap-start active:scale-[0.97] transition-transform duration-150 select-none"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setBannerError(true)}
          />
        )}
        <div className="absolute bottom-0 inset-x-0 px-3 py-3">
          <p className="font-bold text-2xl text-white truncate">{creator.username}</p>
        </div>
      </div>
    </a>
  );
}

export function DiscoverCreatorsStrip({
  creators,
  isLoading,
  getHref,
  allCreatorsHref = "/creators",
  sectionLabel = "Explore",
  title = "Creators",
}: DiscoverCreatorsStripProps) {
  if (!isLoading && creators.length === 0) return null;

  return (
    <FadeIn>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label">{sectionLabel}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Users className="h-4 w-4 text-brand-purple" />
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
          </div>
          <a
            href={allCreatorsHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-5 sm:gap-6 w-max pb-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CreatorChipSkeleton key={i} />)
              : creators.map((c) => (
                  <CreatorChip key={c.walletAddress} creator={c} href={getHref(c)} />
                ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
