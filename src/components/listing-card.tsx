"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Check, Zap, ArrowUpRight } from "lucide-react";
import { MotionCard } from "./motion-primitives.js";
import { CurrencyIcon } from "./currency-icon.js";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice } from "../utils/format.js";
import { timeAgo } from "../utils/time.js";
import type { ApiOrder } from "@medialane/sdk";

export interface ListingCardProps {
  order: ApiOrder;
  inCart?: boolean;
  onBuy?: (order: ApiOrder) => void;
  onCart?: (order: ApiOrder) => void;
  /** App passes a fully constructed <DropdownMenu> here */
  overflowMenu?: React.ReactNode;
  compact?: boolean;
}

export function ListingCard({ order, inCart = false, onBuy, onCart, overflowMenu, compact = false }: ListingCardProps) {
  const [imgError, setImgError] = useState(false);
  const isListing = order.offer.itemType === "ERC721" || order.offer.itemType === "ERC1155";
  const name = order.token?.name ?? `Token #${order.nftTokenId}`;
  const image = order.token?.image ? ipfsToHttp(order.token.image) : null;
  const assetHref = `/asset/${order.nftContract}/${order.nftTokenId}`;

  // Show the action bar for listings (Buy/View) and for offers (View asset),
  // whenever the host wired any action or an overflow menu.
  const showActionBar = !!(onBuy || onCart || overflowMenu);

  // ─── Compact variant ──────────────────────────────────────────────────────
  if (compact) {
    return (
      <MotionCard className="card-base">
        <Link href={assetHref} className="block">
          <div className="relative aspect-square bg-muted overflow-hidden">
            {image && !imgError ? (
              <Image src={image} alt={name} fill unoptimized sizes="(max-width: 640px) 33vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
                <span className="text-xl font-mono text-muted-foreground">#{order.nftTokenId}</span>
              </div>
            )}
          </div>
          <div className="p-2.5 space-y-0.5">
            <p className="text-xs font-semibold truncate">{name}</p>
            {order.price?.formatted && (
              <p className="text-[11px] font-bold price-value inline-flex items-center gap-1">
                {order.price.currency && <CurrencyIcon symbol={order.price.currency} size={11} />}
                {formatDisplayPrice(order.price.formatted)}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">{timeAgo(order.createdAt)}</p>
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
          {image && !imgError ? (
            <Image src={image} alt={name} fill unoptimized sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
              <span className="text-2xl font-mono text-muted-foreground">#{order.nftTokenId}</span>
            </div>
          )}
        </div>

        <div className="p-3.5 space-y-3">
          <div className="min-w-0">
            <p className="font-semibold text-[15px] truncate leading-snug">{name}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-snug mt-0.5">
              {order.token?.description ? order.token.description : `#${order.nftTokenId}`}
            </p>
          </div>

          {/* Price / Offer + age */}
          {order.price?.formatted && (
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/55 leading-none">
                  {isListing ? "Price" : "Offer"}
                </p>
                <p className="text-lg font-bold price-value leading-none inline-flex items-center gap-1.5 mt-1.5">
                  {order.price.currency && <CurrencyIcon symbol={order.price.currency} size={18} />}
                  {formatDisplayPrice(order.price.formatted)}
                  <span className="sr-only">{order.price.currency}</span>
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/60 whitespace-nowrap shrink-0">
                {timeAgo(order.createdAt)}
              </p>
            </div>
          )}

          {showActionBar && (
            <div className="flex items-center gap-1.5">
              {isListing ? (
                onBuy ? (
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
                    "h-9 w-9 shrink-0 rounded-[9px] border flex items-center justify-center transition-colors",
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
