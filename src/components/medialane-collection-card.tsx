"use client";

import { cn } from "../utils/cn.js";

export interface MedialaneCollectionCardProps {

  image?: string | null;

  name?: string;

  collection?: string;

  serial?: string;

  creator?: string;
  className?: string;
}

const FRAME_GRADIENT =
  "linear-gradient(135deg, #3b7bff, #8a5cf6 38%, #f6608f 70%, #fb8b46)";

export function MedialaneCollectionCard({
  image,
  name,
  collection,
  serial,
  creator,
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
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] ring-1 ring-black/10 dark:ring-white/10">
              {image ? (

                <img src={image} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ background: FRAME_GRADIENT, opacity: 0.9 }}
                />
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                style={{ background: "linear-gradient(to top, rgba(10,14,31,0.45), transparent)" }}
              />
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
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full shrink-0"
                style={{ background: FRAME_GRADIENT }}
              />
              <span className="text-[9px] font-bold tracking-[0.18em] text-[#0a0e1f]/50 dark:text-white/50">
                MEDIALANE
              </span>
              {creator && (
                <span className="ml-auto min-w-0 truncate text-2xs text-[#0a0e1f]/55 dark:text-white/55 tabular-nums">
                  {creator}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
