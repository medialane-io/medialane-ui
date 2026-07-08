"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

export function AssetCollectionBar({
  collectionName,
  collectionImage,
  collectionHref,
  currentTokenId,
  siblingTokens,
  onNavigate,
}: AssetCollectionBarProps) {
  // Show up to 4 OTHER tokens — never the current one
  const others = siblingTokens.filter(
    (t) => String(t.tokenId) !== String(currentTokenId)
  );
  const preview = others.slice(0, 4);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-muted/40 to-transparent overflow-hidden p-4 space-y-3">

      {/* Collection identity — links to collection page */}
      <Link href={collectionHref} className="flex items-center gap-3 group min-w-0">
        <div className="relative h-11 w-11 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 ring-1 ring-border/30 group-hover:ring-border/60 transition-all">
          {collectionImage ? (
            <Image src={collectionImage} alt="" fill className="object-cover" unoptimized />
          ) : null}
        </div>
        <p className="text-sm font-bold leading-tight truncate min-w-0 flex-1 group-hover:text-primary transition-colors">
          {collectionName}
        </p>
        <div className="shrink-0 h-8 w-8 rounded-xl bg-background/40 flex items-center justify-center text-muted-foreground group-hover:bg-background/70 group-hover:text-foreground transition-all">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>

      {/* Grid — always 4 columns so thumbnails stay the same size regardless of count */}
      {preview.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => {
            const sibling = preview[i];
            if (!sibling) {
              return <div key={i} className="aspect-square rounded-xl bg-muted/20" />;
            }
            return (
              <button
                key={sibling.tokenId}
                type="button"
                onClick={() => onNavigate(sibling.tokenId)}
                className="group relative aspect-square rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                {sibling.image ? (
                  <Image
                    src={sibling.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
