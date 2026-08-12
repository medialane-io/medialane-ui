"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, Zap, ArrowUpRight } from "lucide-react";
import { MotionCard } from "./motion-primitives.js";
import { CurrencyIcon } from "./currency-icon.js";
import { AnimatedTokenMedia } from "./animated-token-media.js";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";
import { timeAgo } from "../utils/time.js";
import { isLivingRenderCollection } from "../data/living-render-collections.js";
import type { ApiOrder, Chain } from "@medialane/sdk";

/** ui's pinned SDK lags the apps — extend structurally for fields newer SDKs carry. */
type OrderWithAnimation = ApiOrder & { token: (ApiOrder["token"] & { animationUrl?: string | null }) | null };

/**
 * Fiat-first price line: USD leads (io's non-crypto audience reads fiat, not
 * token amounts), the on-chain currency trails as a small icon+label — never
 * a second near-duplicate number for USD-pegged stablecoins. Falls back to
 * a crypto-only line when no USD rate is available.
 */
function PriceLine({
  amountFormatted, currency, usdValue, compact = false,
}: {
  amountFormatted: string | null | undefined;
  currency: string | null | undefined;
  usdValue?: string | null;
  compact?: boolean;
}) {
  if (!amountFormatted) return null;
  if (!usdValue) {
    return (
      <p className={compact ? "text-2xs font-bold price-value inline-flex items-center gap-1" : "text-lg font-bold price-value leading-none inline-flex items-center gap-1.5 mt-1.5"}>
        {currency && <CurrencyIcon symbol={currency} size={compact ? 11 : 18} />}
        {formatDisplayPrice(amountFormatted)}
        {!compact && <span className="sr-only">{currency}</span>}
      </p>
    );
  }
  const stable = isStableCurrency(currency);
  return (
    <>
      <p className={compact ? "text-2xs font-bold price-value" : "text-lg font-bold price-value leading-none mt-1.5"}>
        {usdValue}
      </p>
      <p className={compact ? "text-2xs text-muted-foreground/70 inline-flex items-center gap-1" : "text-2xs text-muted-foreground/60 mt-0.5 inline-flex items-center gap-1"}>
        {currency && <CurrencyIcon symbol={currency} size={compact ? 10 : 11} />}
        {stable ? currency : `${formatDisplayPrice(amountFormatted)} ${currency}`}
      </p>
    </>
  );
}

export interface ListingCardProps {
  order: ApiOrder;
  inCart?: boolean;
  onBuy?: (order: ApiOrder) => void;
  onCart?: (order: ApiOrder) => void;
  /** App passes a fully constructed <DropdownMenu> here */
  overflowMenu?: React.ReactNode;
  /**
   * Optional flex-1 primary control for listings, replacing the default
   * Buy/View button — lets a host inject its own action (e.g. an owner
   * "Cancel" with an app-specific, auth-coupled handler) while keeping this
   * card's layout. Ignored for offers (which always render "View asset").
   */
  primaryAction?: React.ReactNode;
  compact?: boolean;
  /**
   * Pre-resolved, browser-loadable image URL. When provided (including null),
   * overrides the card's internal ipfsToHttp resolution — apps that proxy or
   * resize images (e.g. a same-origin /api/ipfs?w= proxy) pass it here.
   * Omit for the default gateway resolution; null renders the no-image fallback.
   */
  imageUrl?: string | null;
  /**
   * Pre-formatted USD equivalent of order.price (e.g. "$12.34"), computed by
   * the host from its own live rate feed — this package has no price-feed
   * access by design. Omit (or pass null) to render no USD line, e.g. when
   * the host has no live rate for this order's currency.
   */
  usdValue?: string | null;
}

export function ListingCard({ order: rawOrder, inCart = false, onBuy, onCart, overflowMenu, primaryAction, compact = false, imageUrl, usdValue }: ListingCardProps) {
  const order = rawOrder as OrderWithAnimation;
  const [imgError, setImgError] = useState(false);
  const isListing = order.offer.itemType === "ERC721" || order.offer.itemType === "ERC1155";
  const name = order.token?.name ?? `Token #${order.nftTokenId}`;
  const image = imageUrl !== undefined ? imageUrl : (order.token?.image ? ipfsToHttp(order.token.image) : null);
  // Not resolved through ipfsToHttp — animation_url is legitimately a data: URI for
  // fully on-chain-rendered collections (ipfsToHttp rejects data: by design).
  const animationUrl = order.token?.animationUrl ?? null;
  const live = !!(order.chain && order.nftContract) && isLivingRenderCollection(order.chain.toUpperCase() as Chain, order.nftContract!);
  const assetHref = `/asset/${order.nftContract}/${order.nftTokenId}`;

  // Show the action bar for listings (Buy/View) and for offers (View asset),
  // whenever the host wired any action or an overflow menu.
  const showActionBar = !!(onBuy || onCart || overflowMenu || primaryAction);

  // ─── Compact variant ──────────────────────────────────────────────────────
  if (compact) {
    return (
      <MotionCard className="card-base">
        <Link href={assetHref} className="block">
          <div className="relative aspect-square bg-muted overflow-hidden">
            <AnimatedTokenMedia
              image={image}
              animationUrl={animationUrl}
              live={live}
              alt={name}
              mode="fill"
              sizes="(max-width: 640px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              imgError={imgError}
              onImageError={() => setImgError(true)}
              fallback={
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
                  <span className="text-xl font-mono text-muted-foreground">#{order.nftTokenId}</span>
                </div>
              }
            />
          </div>
          <div className="p-2.5 space-y-0.5">
            <p className="text-xs font-semibold truncate">{name}</p>
            <PriceLine amountFormatted={order.price?.formatted} currency={order.price?.currency} usdValue={usdValue} compact />
            <p className="text-2xs text-muted-foreground">{timeAgo(order.createdAt)}</p>
          </div>
        </Link>
      </MotionCard>
    );
  }

  // ─── Full variant ─────────────────────────────────────────────────────────
  return (
    <MotionCard className="card-base">
      <Link href={assetHref} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <AnimatedTokenMedia
            image={image}
            animationUrl={animationUrl}
            live={live}
            alt={name}
            mode="fill"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            imgError={imgError}
            onImageError={() => setImgError(true)}
            fallback={
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
                <span className="text-2xl font-mono text-muted-foreground">#{order.nftTokenId}</span>
              </div>
            }
          />
        </div>

        <div className="p-3.5 space-y-3">
          <div className="min-w-0">
            <p className="font-semibold text-base truncate leading-snug">{name}</p>
            <p className="text-2xs text-muted-foreground truncate leading-snug mt-0.5">
              {order.token?.description ? order.token.description : `#${order.nftTokenId}`}
            </p>
          </div>

          {/* Price / Offer + age */}
          {order.price?.formatted && (
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-2xs uppercase tracking-widest text-muted-foreground/55 leading-none">
                  {isListing ? "Price" : "Offer"}
                </p>
                <PriceLine amountFormatted={order.price.formatted} currency={order.price.currency} usdValue={usdValue} />
              </div>
              <p className="text-2xs text-muted-foreground/60 whitespace-nowrap shrink-0">
                {timeAgo(order.createdAt)}
              </p>
            </div>
          )}

          {showActionBar && (
            <div className="flex items-center gap-1.5">
              {isListing ? (
                primaryAction ? (
                  primaryAction
                ) : onBuy ? (
                  <div className="btn-border-animated p-[1.5px] rounded-[10px] flex-1 h-9">
                    <button
                      className="w-full h-full rounded-[9px] bg-background flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-all active:scale-[0.98]"
                      onClick={(e) => { e.preventDefault(); onBuy(order); }}
                    >
                      <Zap className="h-3.5 w-3.5 shrink-0" /> Buy
                    </button>
                  </div>
                ) : (
                  <Link
                    href={assetHref}
                    className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted/60 transition-all active:scale-[0.98]"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> View
                  </Link>
                )
              ) : (
                <Link
                  href={assetHref}
                  className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-[9px] border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted/60 transition-all active:scale-[0.98]"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> View asset
                </Link>
              )}
              {onCart && (
                <button
                  className={cn(
                    "min-h-11 min-w-11 shrink-0 rounded-[9px] border flex items-center justify-center transition-colors",
                    inCart
                      ? "border-brand-orange/50 bg-brand-orange/10 text-brand-orange"
                      : "border-border bg-background hover:bg-muted text-foreground"
                  )}
                  onClick={(e) => { e.preventDefault(); if (!inCart) onCart(order); }}
                  disabled={inCart}
                  aria-label={inCart ? "Added to cart" : "Add to cart"}
                >
                  {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                </button>
              )}
              {overflowMenu}
            </div>
          )}
        </div>
      </Link>
    </MotionCard>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card-base">
      <div className="aspect-square w-full bg-muted animate-pulse" />
      <div className="p-3 space-y-2.5">
        <div className="space-y-1">
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-1/2 bg-muted animate-pulse rounded" />
        <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
