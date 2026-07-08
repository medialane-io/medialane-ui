"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface AssetCollectionBarSibling {
  tokenId: string;
  /** Already-resolved, ready-to-render src (e.g. via the caller's ipfsToHttp). `null` renders a placeholder. */
  image: string | null;
}

export interface AssetCollectionBarProps {
  collectionName: string;
  /** Already-resolved, ready-to-render src (e.g. via the caller's ipfsToHttp). */
  collectionImage?: string | null;
  collectionHref: string;
  currentTokenId: string;
  siblingTokens: AssetCollectionBarSibling[];
  onNavigate: (tokenId: string) => void;
}

export function AssetCollectionBar({
  collectionName,
  collectionImage,
  collectionHref,
  currentTokenId,
  siblingTokens,
  onNavigate,
}: AssetCollectionBarProps) {
  const currentIndex = siblingTokens.findIndex((t) => String(t.tokenId) === String(currentTokenId));
  const prevToken = currentIndex > 0 ? siblingTokens[currentIndex - 1] : null;
  const nextToken =
    currentIndex >= 0 && currentIndex < siblingTokens.length - 1 ? siblingTokens[currentIndex + 1] : null;
  const showFilmstrip = siblingTokens.length > 1;

  return (
    <div className="space-y-3">
      {/* Collection identity — left-aligned, compact */}
      <Link
        href={collectionHref}
        className="flex items-center gap-2.5 group min-w-0"
      >
        <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0 bg-muted ring-1 ring-border/50 group-hover:ring-border transition-all">
          {collectionImage ? (
            <Image src={collectionImage} alt="" fill className="object-cover" unoptimized />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground leading-none mb-0.5">Collection</p>
          <p className="text-sm font-semibold truncate leading-tight group-hover:text-primary transition-colors">
            {collectionName}
          </p>
        </div>
        {siblingTokens.length > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {siblingTokens.length}
          </span>
        )}
      </Link>

      {/* Filmstrip */}
      {showFilmstrip ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!prevToken}
            onClick={() => prevToken && onNavigate(prevToken.tokenId)}
            className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
            {siblingTokens.map((sibling) => {
              const isCurrent = String(sibling.tokenId) === String(currentTokenId);
              return (
                <button
                  key={sibling.tokenId}
                  type="button"
                  onClick={() => onNavigate(sibling.tokenId)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 rounded-xl overflow-hidden transition-all duration-200",
                    isCurrent
                      ? "opacity-100 scale-100 shadow-sm"
                      : "opacity-50 hover:opacity-80 scale-95 hover:scale-100"
                  )}
                >
                  {sibling.image ? (
                    <Image src={sibling.image} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!nextToken}
            onClick={() => nextToken && onNavigate(nextToken.tokenId)}
            className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
