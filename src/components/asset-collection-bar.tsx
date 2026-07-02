"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Flag } from "lucide-react";
import { IpTypeBadge } from "./ip-type-badge.js";
import { ShareButton } from "./share-button.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { cn } from "../utils/cn.js";

export interface AssetCollectionBarSibling {
  tokenId: string;
  image: string | null;
}

export interface AssetCollectionBarProps {
  collectionName: string;
  collectionImage?: string | null;
  collectionHref: string;
  ipType?: string | null;
  contractExplorerHref: string;
  shareTitle: string;
  onReportClick: () => void;
  currentTokenId: string;
  siblingTokens: AssetCollectionBarSibling[];
  onNavigate: (tokenId: string) => void;
}

/**
 * Consolidated collection identity bar: avatar+name, IP-type pill, and
 * explorer/share/report utility icons on one row, with a filmstrip of
 * collection siblings on a second row for browsing (replaces plain-text
 * Prev/Next). Soft `bg-card/40` surface, no hard border — matches the
 * aurora-glow design language instead of an OpenSea-style boxed panel.
 */
export function AssetCollectionBar({
  collectionName,
  collectionImage,
  collectionHref,
  ipType,
  contractExplorerHref,
  shareTitle,
  onReportClick,
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
    <div className="rounded-2xl bg-card/40 px-4 py-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Link href={collectionHref} className="flex items-center gap-3 min-w-0 group">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20 ring-1 ring-border/60 group-hover:ring-primary/40 transition">
            {collectionImage ? (
              <Image src={ipfsToHttp(collectionImage)} alt="" fill className="object-cover" unoptimized />
            ) : null}
          </div>
          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {collectionName}
          </p>
          {ipType ? <IpTypeBadge ipType={ipType} size="sm" /> : null}
        </Link>

        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          <a
            href={contractExplorerHref}
            target="_blank"
            rel="noopener noreferrer"
            title="View contract"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <ShareButton title={shareTitle} variant="ghost" size="icon" />
          <button
            type="button"
            title="Report this asset"
            onClick={onReportClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>

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
                    <Image src={ipfsToHttp(sibling.image)} alt="" fill className="object-cover" unoptimized />
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
