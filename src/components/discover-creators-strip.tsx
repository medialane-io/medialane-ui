"use client";

import { useState } from "react";
import { Users, ArrowRight, AtSign } from "lucide-react";
import { FadeIn } from "./motion-primitives.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import type { ApiCreatorProfile } from "@medialane/sdk";

export interface DiscoverCreatorsStripProps {
  creators: ApiCreatorProfile[];
  isLoading: boolean;
  getHref: (creator: ApiCreatorProfile) => string;
  allCreatorsHref?: string;
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
  const [avatarError, setAvatarError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  const avatarUrl = creator.avatarImage && !avatarError ? ipfsToHttp(creator.avatarImage) : null;
  const bannerUrl = creator.bannerImage && !bannerError ? ipfsToHttp(creator.bannerImage) : null;
  const displayName = creator.displayName || `@${creator.username}`;

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-2.5 space-y-1.5">
          <div className="h-8 w-8 rounded-full ring-2 ring-white/20 overflow-hidden bg-muted flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName ?? ""}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="text-xs font-black text-white/60">
                {(displayName ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-white text-xs truncate">{displayName}</p>
            <p className="text-[10px] text-white/55 flex items-center gap-0.5">
              <AtSign className="h-2 w-2 shrink-0" />
              <span className="truncate">{creator.username}</span>
            </p>
          </div>
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
}: DiscoverCreatorsStripProps) {
  if (!isLoading && creators.length === 0) return null;

  return (
    <FadeIn>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label">Creator network</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Users className="h-4 w-4 text-brand-purple" />
              <h2 className="text-lg font-bold">Creators</h2>
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
          <div className="flex gap-3 w-max pb-1">
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
