"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";
import { CurrencyIcon } from "./currency-icon.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { AnimatedTokenMedia } from "./animated-token-media.js";

export interface AssetCardPrice {
  formatted?: string | null;
  currency?: string | null;
  /**
   * Pre-formatted USD equivalent (e.g. "$13.15"), computed by the host from
   * its own live rate feed — this package has no price-feed access by
   * design. Omit/null renders the crypto amount alone (today's behavior).
   */
  usdValue?: string | null;
}

export interface AssetCardProps {
  /** Asset detail link. */
  href: string;
  /** Asset title. */
  name: string;
  /** Raw image (ipfs:// or http) — resolved internally. */
  image?: string | null;
  /** Resolved animation_url — the live on-chain renderer, if any. */
  animationUrl?: string | null;
  /** Caller-computed eligibility for the living-render treatment. */
  live?: boolean;
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
 * Card) with the price as a glass pill on the artwork (the collection cards'
 * Floor-pill vocabulary) → one body row: display-face title + optional
 * subtitle, with the optional ipType badge inline on the right.
 */
export function AssetCard({
  href,
  name,
  image,
  animationUrl,
  live = false,
  subtitle,
  ipType,
  price,
  fallbackId,
  indexing = false,
  ipTypeBaseUrl = "",
  className,
}: AssetCardProps) {
  const resolved = image ? ipfsToHttp(image) : null;
  const hasPrice = !!price?.formatted;

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
          <AnimatedTokenMedia
            image={resolved}
            animationUrl={animationUrl}
            live={live}
            alt={name}
            mode="fill"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/25 via-brand-purple/25 to-brand-rose/25">
                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                  #{fallbackId ?? "?"}
                </span>
              </div>
            }
          />

          {/* Price pill — anchored on the artwork, same glass chip as the
              collection cards' Floor pill. Fiat leads when a live rate is
              available; the on-chain amount trails, dimmer, as a secondary
              fact — never a second full-weight number competing for
              attention. Stablecoins collapse to fiat + symbol alone, since
              the crypto amount would just repeat the same figure. */}
          {hasPrice && !indexing && (() => {
            const cryptoDisplay = formatDisplayPrice(price!.formatted!);
            const stable = isStableCurrency(price!.currency);
            return (
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 text-sm font-bold text-white/95 backdrop-blur-md bg-black/40 rounded-full pl-3 pr-3 py-1.5 tabular-nums">
                {price!.usdValue ? (
                  <>
                    {price!.usdValue}
                    <span className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white/65">
                      {price!.currency && <CurrencyIcon symbol={price!.currency} size={12} />}
                      {stable ? price!.currency : cryptoDisplay}
                    </span>
                  </>
                ) : (
                  <>
                    {price!.currency && <CurrencyIcon symbol={price!.currency} size={13} />}
                    {cryptoDisplay}
                  </>
                )}
              </span>
            );
          })()}

          {indexing && (
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm py-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-white/70" />
              <span className="text-2xs text-white/70">Indexing…</span>
            </div>
          )}
        </div>
      </Link>

      {/* Body — one tight block: title (+ optional ipType badge inline) and subtitle */}
      <div className="flex items-start justify-between gap-2 px-3 py-3">
        <Link href={href} className="block min-w-0 flex-1">
          <p className="text-base font-bold line-clamp-1 leading-snug">
            {name}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
              {subtitle}
            </p>
          )}
        </Link>

        {ipType && (
          <div className="shrink-0 mt-0.5">
            <IpTypeBadge ipType={ipType} size="sm" baseUrl={ipTypeBaseUrl} />
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
