"use client";

import { useState } from "react";
import Link from "./link.js";
import { ShoppingCart, Check, Zap, ArrowUpRight } from "lucide-react";
import { MotionCard } from "./motion-primitives.js";
import { AnimatedTokenMedia } from "./animated-token-media.js";
import { cn } from "../utils/cn.js";
import { formatDisplayPrice, isStableCurrency } from "../utils/format.js";
import { timeAgo } from "../utils/time.js";
import { isLivingRenderCollection } from "../data/living-render-collections.js";
import { assetHref as buildAssetHref, type ApiOrder, type Chain } from "@medialane/sdk";
import { useImageUrl } from "../utils/use-image-url.js";

type OrderWithAnimation = ApiOrder & { token: (ApiOrder["token"] & { animationUrl?: string | null }) | null };

function CardPrice({
  amountFormatted, currency, usdValue,
}: {
  amountFormatted: string | null | undefined;
  currency: string | null | undefined;
  usdValue?: string | null;
}) {
  if (!amountFormatted) return null;
  const amount = formatDisplayPrice(amountFormatted);
  const primary = usdValue ?? amount;
  const secondary = !usdValue ? currency : isStableCurrency(currency) ? currency : `${amount} ${currency}`;
  return (
    <p className="flex items-baseline gap-1.5 tabular-nums">
      <span className="text-base font-bold tracking-tight">{primary}</span>
      {secondary && <span className="text-xs text-muted-foreground">{secondary}</span>}
    </p>
  );
}

export interface ListingCardProps {
  order: ApiOrder;
  inCart?: boolean;
  onBuy?: (order: ApiOrder) => void;
  onCart?: (order: ApiOrder) => void;

  overflowMenu?: React.ReactNode;

  primaryAction?: React.ReactNode;
  compact?: boolean;

  imageUrl?: string | null;

  usdValue?: string | null;
}

export function ListingCard({ order: rawOrder, inCart = false, onBuy, onCart, overflowMenu, primaryAction, compact = false, imageUrl, usdValue }: ListingCardProps) {
  const resolveImage = useImageUrl();
  const order = rawOrder as OrderWithAnimation;
  const [imgError, setImgError] = useState(false);
  const isListing = order.offer.itemType === "ERC721" || order.offer.itemType === "ERC1155";
  const name = order.token?.name ?? `Token #${order.nftTokenId}`;
  const image = imageUrl !== undefined ? imageUrl : (order.token?.image ? resolveImage(order.token.image, { width: 480 }) : null);

  const animationUrl = order.token?.animationUrl ?? null;
  const live = !!(order.chain && order.nftContract) && isLivingRenderCollection(order.chain.toUpperCase() as Chain, order.nftContract!);
  const assetHref = buildAssetHref("STARKNET", order.nftContract ?? "", order.nftTokenId ?? "");

  const showActionBar = !!(onBuy || onCart || overflowMenu || primaryAction);

  if (compact) {
    return (
      <MotionCard className="group">
        <Link href={assetHref} className="block">
          <div className="relative aspect-square bg-muted overflow-hidden rounded-xl">
            <AnimatedTokenMedia
              image={image}
              animationUrl={animationUrl}
              live={live}
              alt={name}
              mode="fill"
              sizes="(max-width: 640px) 33vw, 20vw"
              className="object-cover"
              imgError={imgError}
              onImageError={() => setImgError(true)}
              fallback={
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/15 to-brand-blue/15" />
              }
            />
          </div>
          <div className="px-0.5 pt-2.5 space-y-0.5">
            <p className="text-xs font-medium truncate">{name}</p>
            <CardPrice amountFormatted={order.price?.formatted} currency={order.price?.currency} usdValue={usdValue} />
            <p className="text-2xs text-muted-foreground">{timeAgo(order.createdAt)}</p>
          </div>
        </Link>
      </MotionCard>
    );
  }

  return (
    <MotionCard className="group">
      <Link href={assetHref} className="block">
        <div className="relative aspect-square bg-muted overflow-hidden rounded-xl">
          <AnimatedTokenMedia
            image={image}
            animationUrl={animationUrl}
            live={live}
            alt={name}
            mode="fill"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            imgError={imgError}
            onImageError={() => setImgError(true)}
            fallback={
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/15 to-brand-blue/15" />
            }
          />
        </div>

        <div className="px-0.5 pt-3 space-y-2.5">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium truncate">{name}</p>
            <CardPrice amountFormatted={order.price?.formatted} currency={order.price?.currency} usdValue={usdValue} />
          </div>

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
    <div>
      <div className="aspect-square w-full rounded-xl bg-muted animate-pulse" />
      <div className="px-0.5 pt-3 space-y-2.5">
        <div className="space-y-1">
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-full bg-muted animate-pulse rounded-[9px]" />
      </div>
    </div>
  );
}
