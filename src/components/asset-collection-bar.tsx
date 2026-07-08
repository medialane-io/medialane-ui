"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface AssetCollectionBarSibling {
  tokenId: string;
  /** Already-resolved, ready-to-render src. `null` renders a placeholder. */
  image: string | null;
}

export interface AssetCollectionBarProps {
  collectionName: string;
  collectionImage?: string | null;
  collectionHref: string;
  currentTokenId: string;
  siblingTokens: AssetCollectionBarSibling[];
  onNavigate: (tokenId: string) => void;
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function AssetCollectionBar({
  collectionName,
  collectionImage,
  collectionHref,
  currentTokenId,
  siblingTokens,
  onNavigate,
}: AssetCollectionBarProps) {
  const total = siblingTokens.length;
  const currentIndex = siblingTokens.findIndex(
    (t) => String(t.tokenId) === String(currentTokenId)
  );

  // Window of up to 4 items centered around the current token
  const PREVIEW_SIZE = 4;
  const windowStart = Math.max(
    0,
    Math.min(currentIndex - 1, total - PREVIEW_SIZE)
  );
  const preview = siblingTokens.slice(windowStart, windowStart + PREVIEW_SIZE);
  const colCount = Math.min(preview.length, 4) as 1 | 2 | 3 | 4;
  const gridCols = GRID_COLS[colCount] ?? "grid-cols-4";

  const showGrid = total > 1;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">

      {/* ── Collection identity ── */}
      <div className="px-4 pt-4 pb-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2.5 select-none">
          Collection
        </p>
        <Link href={collectionHref} className="flex items-center gap-3 group min-w-0">
          {/* Avatar */}
          <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 ring-1 ring-border/40 group-hover:ring-border/70 transition-all">
            {collectionImage ? (
              <Image src={collectionImage} alt="" fill className="object-cover" unoptimized />
            ) : null}
          </div>

          {/* Name */}
          <p className="text-sm font-bold leading-tight truncate min-w-0 flex-1 group-hover:text-primary transition-colors">
            {collectionName}
          </p>

          {/* Arrow chip */}
          <div className="shrink-0 h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* ── Grid explorer ── */}
      {showGrid && (
        <>
          <div className="h-px bg-border/40 mx-4" />
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
                In this collection · {total}
              </p>
              {total > PREVIEW_SIZE && (
                <Link
                  href={collectionHref}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  See all →
                </Link>
              )}
            </div>

            <div className={cn("grid gap-1.5", gridCols)}>
              {preview.map((sibling) => {
                const isCurrent =
                  String(sibling.tokenId) === String(currentTokenId);
                return (
                  <button
                    key={sibling.tokenId}
                    type="button"
                    onClick={() => !isCurrent && onNavigate(sibling.tokenId)}
                    disabled={isCurrent}
                    className={cn(
                      "group relative aspect-square rounded-xl overflow-hidden transition-all duration-200",
                      isCurrent
                        ? "opacity-100 cursor-default"
                        : "opacity-50 hover:opacity-100 active:scale-95"
                    )}
                  >
                    {sibling.image ? (
                      <Image
                        src={sibling.image}
                        alt=""
                        fill
                        className={cn(
                          "object-cover transition-transform duration-300",
                          !isCurrent && "group-hover:scale-105"
                        )}
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
