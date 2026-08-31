"use client";

import { ImageIcon } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface MedialaneCollectionCardProps {

  image?: string | null;

  name?: string;

  collection?: string;

  serial?: string;

  creator?: string;

  /** Explorer/profile URL for the creator address — makes the footer address a link. */
  creatorHref?: string;
  className?: string;
}

export function MedialaneCollectionCard({
  image,
  name,
  collection,
  serial,
  creator,
  creatorHref,
  className,
}: MedialaneCollectionCardProps) {
  const displayName = name?.trim() || "Untitled";

  return (
    <div className={cn(className)}>
      <div className="rounded-[24px] border border-border">
        <div
          className="ml-card-material relative rounded-[23px] overflow-hidden text-[#0a0e1f] dark:text-white"
        >

          <div className="p-2.5 pb-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] ring-1 ring-black/10 dark:ring-white/10 bg-muted">
              {image ? (

                <img src={image} alt={displayName} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
          </div>

          <div className="relative px-4 pt-3 pb-4">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-[18px] font-bold leading-snug truncate">
                {displayName}
              </p>
              {serial && (
                <span className="mt-0.5 shrink-0 rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-2xs font-semibold text-[#0a0e1f]/80 dark:text-white/80 tabular-nums">
                  {serial}
                </span>
              )}
            </div>
            {collection && (
              <p className="mt-0.5 text-[12.5px] text-[#0a0e1f]/55 dark:text-white/55 truncate">{collection}</p>
            )}
            <div className="my-3 h-px bg-black/10 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-[0.18em] text-[#0a0e1f]/50 dark:text-white/50">
                STARKNET
              </span>
              {creator && (
                creatorHref ? (
                  <a
                    href={creatorHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto min-w-0 truncate text-2xs text-[#0a0e1f]/55 dark:text-white/55 tabular-nums hover:text-[#0a0e1f]/80 dark:hover:text-white/80 transition-colors"
                  >
                    {creator}
                  </a>
                ) : (
                  <span className="ml-auto min-w-0 truncate text-2xs text-[#0a0e1f]/55 dark:text-white/55 tabular-nums">
                    {creator}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
