"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart, Tag, ArrowRightLeft, X, Loader2, HandCoins,
  Check, ArrowUpRight, Zap,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice } from "../utils/format.js";
import { CurrencyIcon } from "./currency-icon.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { MotionCard } from "./motion-primitives.js";
import type { ApiToken } from "@medialane/sdk";

export type RarityTier = "legendary" | "epic" | "rare" | "uncommon" | "common";

const RARITY_STYLE: Record<RarityTier, { label: string; className: string } | null> = {
  legendary: { label: "Legendary", className: "bg-yellow-400/90 text-yellow-900" },
  epic:      { label: "Epic",      className: "bg-purple-500/85 text-white" },
  rare:      { label: "Rare",      className: "bg-blue-500/85 text-white" },
  uncommon:  { label: "Uncommon",  className: "bg-emerald-500/85 text-white" },
  common:    null,
};

const BTN_BASE = "h-8 rounded-[11px] flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98] shadow-none border-0";
const BTN_SOLID = cn(BTN_BASE, "text-white hover:brightness-110");
const BTN_OUTLINE = cn(BTN_BASE, "border border-border/60 text-foreground hover:bg-muted/60");

export interface TokenCardProps {
  token: ApiToken;
  /** Whether the current user owns this token. Default: false */
  isOwner?: boolean;
  /** Whether this token's listing is already in the cart. Default: false */
  inCart?: boolean;
  /** Show the Buy button for listed tokens. Default: true */
  showBuyButton?: boolean;
  /** Optional rarity label shown as an overlay badge */
  rarityTier?: RarityTier;
  className?: string;
  /** Callbacks — omit any to hide that button */
  onBuy?: (token: ApiToken) => void;
  onCart?: (token: ApiToken) => void;
  onOffer?: (token: ApiToken) => void;
  onList?: (token: ApiToken) => void;
  onCancel?: (token: ApiToken) => void;
  onTransfer?: (token: ApiToken) => void;
  onRemix?: (token: ApiToken) => void;
  onReport?: (token: ApiToken) => void;
  /** Slot for a DropdownMenu trigger — rendered after primary buttons */
  overflowMenu?: React.ReactNode;
}

export function TokenCard({
  token,
  isOwner = false,
  inCart = false,
  showBuyButton = true,
  rarityTier,
  className,
  onBuy,
  onCart,
  onOffer,
  onList,
  onCancel,
  onTransfer,
  overflowMenu,
}: TokenCardProps) {
  const [imgError, setImgError] = useState(false);

  const name = token.metadata?.name || `Token #${token.tokenId}`;
  const image = ipfsToHttp(token.metadata?.image);
  const activeOrder = token.activeOrders?.[0];
  const assetHref = `/asset/${token.contractAddress}/${token.tokenId}`;

  const renderActions = () => {
    // Non-owner + listed + showBuyButton
    if (!isOwner && activeOrder && showBuyButton) {
      return (
        <>
          {onBuy && (
            <button
              className={cn(BTN_SOLID, "flex-1 bg-brand-purple")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBuy(token); }}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" />
              Buy
            </button>
          )}
          {onCart && (
            <button
              className={cn(
                BTN_OUTLINE, "w-8 shrink-0",
                inCart && "border-brand-orange/50 bg-brand-orange/10 text-brand-orange"
              )}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCart(token); }}
              disabled={inCart}
              aria-label={inCart ? "In cart" : "Add to cart"}
            >
              {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
            </button>
          )}
          {onOffer && (
            <button
              className={cn(BTN_OUTLINE, "w-8 shrink-0 text-brand-orange border-brand-orange/40 hover:bg-brand-orange/10")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOffer(token); }}
              aria-label="Make an offer"
            >
              <HandCoins className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      );
    }

    // Non-owner + no listing (or showBuyButton=false)
    if (!isOwner) {
      if (!onOffer) return null;
      return (
        <>
          <Link href={assetHref} className={cn(BTN_OUTLINE, "flex-1")}>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            View
          </Link>
          <button
            className={cn(BTN_OUTLINE, "w-8 shrink-0 text-brand-orange border-brand-orange/40 hover:bg-brand-orange/10")}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOffer(token); }}
            aria-label="Make an offer"
          >
            <HandCoins className="h-3.5 w-3.5" />
          </button>
        </>
      );
    }

    // Owner + listed
    if (isOwner && activeOrder) {
      if (!onCancel) return null;
      return (
        <>
          <button
            className={cn(BTN_SOLID, "flex-1 bg-brand-rose")}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(token); }}
          >
            <X className="h-3.5 w-3.5 shrink-0" />
            Cancel listing
          </button>
          {onTransfer && (
            <button
              className={cn(BTN_OUTLINE, "w-8 shrink-0")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTransfer(token); }}
              aria-label="Transfer"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      );
    }

    // Owner + unlisted
    if (isOwner && !activeOrder) {
      if (!onList) return null;
      return (
        <>
          <button
            className={cn(BTN_SOLID, "flex-1 bg-brand-blue")}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onList(token); }}
          >
            <Tag className="h-3.5 w-3.5 shrink-0" />
            List for sale
          </button>
          {onTransfer && (
            <button
              className={cn(BTN_OUTLINE, "w-8 shrink-0")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTransfer(token); }}
              aria-label="Transfer"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      );
    }

    return null;
  };

  const actionContent = renderActions();
  const showActionBar = actionContent != null || !!overflowMenu;

  return (
    <MotionCard className={cn("card-base group relative overflow-hidden flex flex-col", className)}>
      <Link href={assetHref} className="block relative shrink-0">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {!imgError ? (
            <Image
              src={image}
              alt={name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
              <span className="text-2xl font-mono text-muted-foreground">#{token.tokenId}</span>
            </div>
          )}

          {token.metadata?.ipType && (
            <div className="absolute top-2 left-2">
              <IpTypeBadge ipType={token.metadata.ipType as any} size="sm" />
            </div>
          )}

          {rarityTier && RARITY_STYLE[rarityTier] && (
            <div className="absolute top-2 right-2 z-10">
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold leading-none",
                RARITY_STYLE[rarityTier]!.className
              )}>
                {RARITY_STYLE[rarityTier]!.label}
              </span>
            </div>
          )}

          {(token.metadataStatus === "PENDING" || token.metadataStatus === "FETCHING") && (
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm py-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-white/70" />
              <span className="text-[10px] text-white/70">Indexing…</span>
            </div>
          )}
        </div>
      </Link>

      <div className="px-3 pt-2.5 pb-1 flex-1">
        <Link href={assetHref} className="block space-y-0.5 mb-2">
          <p className="text-xl font-bold line-clamp-2 leading-tight">{name}</p>
          {activeOrder && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-foreground/80">
              <CurrencyIcon symbol={activeOrder.price.currency} size={11} />
              {formatDisplayPrice(activeOrder.price.formatted)}
              <span className="font-normal text-muted-foreground">{activeOrder.price.currency}</span>
            </p>
          )}
          {token.metadata?.description ? (
            <p className="text-[10px] text-muted-foreground truncate leading-snug">
              {token.metadata.description}
            </p>
          ) : token.metadata?.ipType ? (
            <p className="text-[10px] text-muted-foreground opacity-70">{token.metadata.ipType}</p>
          ) : null}
        </Link>
      </div>

      {showActionBar && (
        <div className="flex items-center gap-1.5 px-2 pb-2">
          {actionContent}
          {overflowMenu}
        </div>
      )}
    </MotionCard>
  );
}

export function TokenCardSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="px-3 pt-2.5 pb-2 space-y-1.5">
        <div className="h-5 w-3/4 rounded-md animate-pulse bg-muted" />
        <div className="h-2.5 w-2/5 rounded-md animate-pulse bg-muted" />
      </div>
      <div className="px-2 pb-2 flex gap-1.5">
        <div className="h-8 flex-1 rounded-[11px] animate-pulse bg-muted" />
        <div className="h-8 w-8 rounded-[11px] animate-pulse bg-muted shrink-0" />
        <div className="h-8 w-8 rounded-[11px] animate-pulse bg-muted shrink-0" />
      </div>
    </div>
  );
}
