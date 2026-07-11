"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice } from "../utils/format.js";
import { CurrencyIcon } from "./currency-icon.js";
import { IpTypeBadge } from "./ip-type-badge.js";

export interface AssetCardPrice {
  formatted?: string | null;
  currency?: string | null;
}

export interface AssetCardProps {
  /** Asset detail link. */
  href: string;
  /** Asset title. */
  name: string;
  /** Raw image (ipfs:// or http) — resolved internally. */
  image?: string | null;
  /** Secondary line under the title (collection or description). */
  subtitle?: string | null;
  /** IP type (apiValue or label) — renders the icon badge on the footer left. */
  ipType?: string | null;
  /** Listing price; omit/null shows no price. */
  price?: AssetCardPrice | null;
  /** Shown when the image is missing/errors (e.g. token id). */
  fallbackId?: string | null;
  /** Show the "Indexing…" overlay. */
  indexing?: boolean;
  /** Base URL for the ipType badge link. Default "" (relative). */
  ipTypeBaseUrl?: string;
  className?: string;
}

/**
 * The platform's shared asset card — lean and presentational.
 *
 * Intentionally has no action buttons, dropdowns or dialogs: the image and
 * text are the only interactive surface (a single asset link), which keeps
 * browse grids and carousels fast even when many cards render. Surfaces that
 * need owner/marketplace actions use the richer `TokenCard` / `ListingCard`.
 *
 * Layout: inset 4:5 artwork (gallery ratio, echoing the Medialane Collection
 * Card) → display-face title → optional subtitle → footer row with the
 * (optional) ipType icon on the left and the (optional) price on the right.
 */
export function AssetCard({
  href,
  name,
  image,
  subtitle,
  ipType,
  price,
  fallbackId,
  indexing = false,
  ipTypeBaseUrl = "",
  className,
}: AssetCardProps) {
  const [imgError, setImgError] = useState(false);
  const resolved = image ? ipfsToHttp(image) : null;
  const hasPrice = !!price?.formatted;
  const showFooter = !!ipType || hasPrice;

  return (
    <div
      className={cn(
        "card-base group relative flex flex-col w-full transition-colors hover:border-foreground/20",
        className
      )}
    >
      {/* Artwork — inset with a gallery 4:5 ratio, like the Collection Card */}
      <Link href={href} className="block p-1.5 pb-0">
        <div className="relative aspect-[4/5] rounded-[12px] bg-muted overflow-hidden ring-1 ring-border/50">
          {resolved && !imgError ? (
            <Image
              src={resolved}
              alt={name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/25 via-brand-purple/25 to-brand-rose/25">
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                #{fallbackId ?? "?"}
              </span>
            </div>
          )}

          {indexing && (
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm py-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-white/70" />
              <span className="text-[10px] text-white/70">Indexing…</span>
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-3 py-3">
        <Link href={href} className="block min-w-0">
          <p
            className="text-[15px] font-bold line-clamp-1 leading-snug"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            {name}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
              {subtitle}
            </p>
          )}
        </Link>

        {showFooter && (
          <div className="flex items-center justify-between gap-2">
            {ipType ? (
              <IpTypeBadge ipType={ipType} size="sm" baseUrl={ipTypeBaseUrl} />
            ) : (
              <span />
            )}
            {hasPrice && (
              <span className="inline-flex shrink-0 items-center gap-1 text-sm leading-none price-value">
                {price!.currency && <CurrencyIcon symbol={price!.currency} size={12} />}
                {formatDisplayPrice(price!.formatted!)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="card-base flex flex-col w-full">
      <div className="p-1.5 pb-0">
        <div className="aspect-[4/5] w-full animate-pulse bg-muted rounded-[12px]" />
      </div>
      <div className="px-3 py-3 space-y-1.5">
        <div className="h-4 w-3/4 rounded-md animate-pulse bg-muted" />
        <div className="h-3.5 w-2/5 rounded-md animate-pulse bg-muted" />
      </div>
    </div>
  );
}
