"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AddressDisplay } from "./address-display.js";
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
  /** Single-owner identity (ERC-721) — rendered under the collection name so
   *  "who owns it" and "where it lives" sit together. Omit for ERC-1155
   *  editions (multiple owners; use `AssetOwnersPanel` instead). */
  ownerAddress?: string | null;
  ownerHref?: string;
}

/**
 * Collection identity bar: centered avatar+name (+ owner, when given), with
 * a filmstrip of collection siblings on a second row for browsing (replaces
 * plain-text Prev/Next). Soft `bg-card/40` surface, no hard border — matches
 * the aurora-glow design language instead of an OpenSea-style boxed panel.
 * Other asset-level concerns (IP-type, explorer/share/report) still live
 * elsewhere (`AssetHeaderBlock`, `AssetUtilityIcons`).
 */
export function AssetCollectionBar({
  collectionName,
  collectionImage,
  collectionHref,
  currentTokenId,
  siblingTokens,
  onNavigate,
  ownerAddress,
  ownerHref,
}: AssetCollectionBarProps) {
  const currentIndex = siblingTokens.findIndex((t) => String(t.tokenId) === String(currentTokenId));
  const prevToken = currentIndex > 0 ? siblingTokens[currentIndex - 1] : null;
  const nextToken =
    currentIndex >= 0 && currentIndex < siblingTokens.length - 1 ? siblingTokens[currentIndex + 1] : null;
  const showFilmstrip = siblingTokens.length > 1;

  return (
    <div className="rounded-2xl bg-card/40 px-4 py-3 space-y-3">
      <Link href={collectionHref} className="flex items-center justify-center gap-3 min-w-0 group">
        <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20 ring-1 ring-border/60 group-hover:ring-primary/40 transition">
          {collectionImage ? (
            <Image src={collectionImage} alt="" fill className="object-cover" unoptimized />
          ) : null}
        </div>
        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
          {collectionName}
        </p>
      </Link>

      {ownerAddress && ownerHref ? (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground -mt-1.5">
          <span>Owner</span>
          <Link href={ownerHref} className="hover:text-primary transition-colors font-medium">
            <AddressDisplay address={ownerAddress} />
          </Link>
        </div>
      ) : null}

      {showFilmstrip ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!prevToken}
            onClick={() => prevToken && onNavigate(prevToken.tokenId)}
            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {siblingTokens.map((sibling) => {
              const isCurrent = String(sibling.tokenId) === String(currentTokenId);
              return (
                <button
                  key={sibling.tokenId}
                  type="button"
                  onClick={() => onNavigate(sibling.tokenId)}
                  className={cn(
                    "relative h-11 w-11 shrink-0 rounded-lg overflow-hidden ring-2 transition",
                    isCurrent ? "ring-primary" : "ring-transparent hover:ring-border"
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
            className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
