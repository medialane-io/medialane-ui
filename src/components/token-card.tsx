"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2, ArrowUpRight, MoreHorizontal, Zap, HandCoins, Tag,
  Layers, GitBranch, Flag, UserCircle2, ArrowRightLeft, XCircle,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./dropdown-menu.js";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { formatDisplayPrice } from "../utils/format.js";
import { CurrencyIcon } from "./currency-icon.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { assetHref as buildAssetHref, collectionHref as buildCollectionHref } from "@medialane/sdk";
import type { ApiToken, Chain } from "@medialane/sdk";

const BTN_BASE = "h-8 rounded-[9px] flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98] shadow-none border-0";
const BTN_OUTLINE = cn(BTN_BASE, "border border-border/60 text-foreground hover:bg-muted/60");

export interface TokenCardProps {
  token: ApiToken;
  isOwner?: boolean;
  onList?: (token: ApiToken) => void;
  onTransfer?: (token: ApiToken) => void;
  onCancel?: (token: ApiToken) => void;
  onBuy?: (token: ApiToken) => void;
  onOffer?: (token: ApiToken) => void;
  onReport?: (token: ApiToken) => void;
}

export function TokenCard({
  token,
  isOwner = false,
  onList,
  onTransfer,
  onCancel,
  onBuy,
  onOffer,
  onReport,
}: TokenCardProps) {
  const [imgError, setImgError] = useState(false);

  const name = token.metadata?.name || `Token #${token.tokenId}`;
  const image = ipfsToHttp(token.metadata?.image);
  const ipType = token.metadata?.ipType;

  // First listing-type active order (offer.itemType = ERC721 or ERC1155)
  const listingOrder = token.activeOrders?.find(
    (o) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155"
  );

  const creatorAttr = token.metadata?.attributes?.find((a) => a.trait_type === "Creator");
  const creator = typeof creatorAttr?.value === "string" ? creatorAttr.value : null;
  const owner = token.balances?.[0]?.owner ?? token.owner ?? null;

  const chain = token.chain.toUpperCase() as Chain;
  const assetHref = buildAssetHref(chain, token.contractAddress, token.tokenId);
  const collectionHref = buildCollectionHref(chain, token.contractAddress);
  const remixHref = `/create/remix/${token.contractAddress}/${token.tokenId}`;

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBuy?.(token);
  };

  const handleOffer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOffer?.(token);
  };

  return (
    <div className="card-base relative overflow-hidden flex flex-col w-full">

      {/* ── Clickable image + info ─────────────────────────────── */}
      <Link href={assetHref} className="flex flex-col flex-1">

        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden shrink-0">
          {!imgError ? (
            <Image
              src={image}
              alt={name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
              <span className="text-2xl tabular-nums text-muted-foreground">#{token.tokenId}</span>
            </div>
          )}

          {/* Price chip — bottom right overlay */}
          {listingOrder && (
            <div className="absolute bottom-2 right-2 z-10">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-background/90 backdrop-blur-sm border border-border/40 shadow-sm">
                <CurrencyIcon symbol={listingOrder.price.currency ?? ""} size={10} />
                {formatDisplayPrice(listingOrder.price.formatted)}
                <span className="text-muted-foreground font-normal">{listingOrder.price.currency}</span>
              </span>
            </div>
          )}

          {/* Indexing indicator */}
          {(token.metadataStatus === "PENDING" || token.metadataStatus === "FETCHING") && (
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm py-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-white/70" />
              <span className="text-[10px] text-white/70">Indexing…</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-3 pt-2.5 pb-4 flex-1">
          <p className="text-base font-bold line-clamp-2 leading-snug">{name}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {ipType && <IpTypeBadge ipType={ipType as any} size="sm" />}
            {creator ? (
              <p className="text-[10px] tabular-nums text-muted-foreground/60 truncate">
                {creator.slice(0, 8)}…{creator.slice(-6)}
              </p>
            ) : token.metadata?.description ? (
              <p className="text-[10px] text-muted-foreground truncate leading-snug">
                {token.metadata.description}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      {/* ── Action row ────────────────────────────────────────── */}
      <div className="px-3 pb-3 flex items-center gap-1.5">

        {/* Expand */}
        <Link
          href={assetHref}
          className={cn(BTN_OUTLINE, "w-8 shrink-0 px-0")}
          title="View asset"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>

        {/* Owner: List (or Listed label) — Buyer: Buy / Make offer */}
        {isOwner ? (
          listingOrder ? (
            <Link href={assetHref} className={cn(BTN_OUTLINE, "flex-1")}>
              <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
              View
            </Link>
          ) : (
            <button
              className={cn(BTN_OUTLINE, "flex-1 text-brand-purple border-brand-purple/30 hover:bg-brand-purple/10 hover:text-brand-purple")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onList?.(token); }}
            >
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              List
            </button>
          )
        ) : listingOrder ? (
          <div className="btn-border-animated p-[1.5px] rounded-[10px] flex-1 h-8">
            <button
              className="w-full h-full rounded-[9px] bg-background flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-all active:scale-[0.98]"
              onClick={handleBuy}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" />
              Buy
            </button>
          </div>
        ) : (
          <button
            className={cn(BTN_OUTLINE, "flex-1 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 hover:text-brand-orange")}
            onClick={handleOffer}
          >
            <HandCoins className="h-3.5 w-3.5 mr-1.5" />
            Offer
          </button>
        )}

        {/* 3-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(BTN_OUTLINE, "w-8 p-0 shrink-0")}
              aria-label="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">

            <DropdownMenuItem asChild>
              <Link href={assetHref} className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                View asset
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {isOwner ? (
              <>
                {!listingOrder && onList && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-brand-purple focus:text-brand-purple"
                    onClick={() => onList(token)}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    List
                  </DropdownMenuItem>
                )}
                {onTransfer && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => onTransfer(token)}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    Transfer
                  </DropdownMenuItem>
                )}
                {listingOrder && onCancel && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-brand-orange focus:text-brand-orange"
                    onClick={() => onCancel(token)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel listing
                  </DropdownMenuItem>
                )}
              </>
            ) : (
              <>
                {listingOrder && onBuy && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-brand-blue focus:text-brand-blue"
                    onClick={handleBuy}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span className="flex items-center gap-1">
                      Buy —
                      <CurrencyIcon symbol={listingOrder.price.currency} size={12} />
                      {formatDisplayPrice(listingOrder.price.formatted)}
                    </span>
                  </DropdownMenuItem>
                )}
                {onOffer && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-brand-orange focus:text-brand-orange"
                    onClick={handleOffer}
                  >
                    <HandCoins className="h-3.5 w-3.5" />
                    Make offer
                  </DropdownMenuItem>
                )}
              </>
            )}

            <DropdownMenuItem asChild>
              <Link href={remixHref} className="flex items-center gap-2 text-brand-purple focus:text-brand-purple">
                <GitBranch className="h-3.5 w-3.5" />
                Remix
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={collectionHref} className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                View collection
              </Link>
            </DropdownMenuItem>

            {(owner ?? creator) && (
              <DropdownMenuItem asChild>
                <Link href={`/account/${owner ?? creator}`} className="flex items-center gap-2">
                  <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  View owner
                </Link>
              </DropdownMenuItem>
            )}

            {onReport && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-muted-foreground focus:text-muted-foreground"
                  onClick={() => onReport(token)}
                >
                  <Flag className="h-3.5 w-3.5" />
                  Report
                </DropdownMenuItem>
              </>
            )}

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function TokenCardSkeleton() {
  return (
    <div className="card-base overflow-hidden">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="px-3 pt-2.5 pb-3 space-y-1.5">
        <div className="h-4 w-3/4 rounded-md animate-pulse bg-muted" />
        <div className="h-2.5 w-2/5 rounded-md animate-pulse bg-muted" />
      </div>
      <div className="px-3 pb-3 flex gap-1.5">
        <div className="h-8 w-8 rounded-[9px] animate-pulse bg-muted shrink-0" />
        <div className="h-8 flex-1 rounded-[9px] animate-pulse bg-muted" />
        <div className="h-8 w-8 rounded-[9px] animate-pulse bg-muted shrink-0" />
      </div>
    </div>
  );
}
