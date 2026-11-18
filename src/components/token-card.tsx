"use client";

import Link from "./link.js";
import {
  Loader2, ArrowUpRight, MoreHorizontal, Zap, HandCoins, Tag,
  Layers, GitBranch, Flag, UserCircle2, ArrowRightLeft, XCircle, Archive,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./dropdown-menu.js";
import { cn } from "../utils/cn.js";
import { formatDisplayPrice } from "../utils/format.js";
import { CurrencyIcon } from "./currency-icon.js";
import { PriceDisplay } from "./price-display.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { AnimatedTokenMedia } from "./animated-token-media.js";
import { isLivingRenderCollection } from "../data/living-render-collections.js";
import { assetHref as buildAssetHref, collectionHref as buildCollectionHref } from "@medialane/sdk";
import type { ApiToken, Chain } from "@medialane/sdk";
import { tokenProfileLink } from "../utils/token-profile-link.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useT } from "../i18n/provider.js";


const BTN_BASE = "h-8 rounded-[9px] flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-[0.98] shadow-none border-0";
const BTN_OUTLINE = cn(BTN_BASE, "border border-border/60 text-foreground hover:bg-muted/60");

export interface TokenCardProps {
  token: ApiToken;
  isOwner?: boolean;
  onList?: (token: ApiToken) => void;
  onTransfer?: (token: ApiToken) => void;
  onCancel?: (token: ApiToken) => void;
  onArchive?: (token: ApiToken) => void;
  onBuy?: (token: ApiToken) => void;
  onOffer?: (token: ApiToken) => void;
  onReport?: (token: ApiToken) => void;

  usdValue?: string | null;
}

type TokenCardActions = Pick<TokenCardProps, "onList" | "onTransfer" | "onArchive" | "onCancel" | "onBuy" | "onOffer">;

export function TokenCard({ token, isOwner = false, onReport, usdValue, ...handlers }: TokenCardProps) {
  const t = useT();
  const archived = token.isArchived;
  const { onList, onTransfer, onArchive, onCancel, onBuy, onOffer }: TokenCardActions = archived ? {} : handlers;
  const resolveImage = useImageUrl();
  const name = token.metadata?.name || `Token #${token.tokenId}`;
  const image = resolveImage(token.metadata?.image, { width: 480 });
  const animationUrl = token.metadata?.animationUrl ?? null;
  const ipType = token.metadata?.ipType;

  const listingOrder = archived
    ? undefined
    : token.activeOrders?.find((o) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155");

  const profileLink = tokenProfileLink(token);
  const hasPrimaryAction = isOwner ? !listingOrder && !!onList : listingOrder ? !!onBuy : !!onOffer;

  const chain = token.chain.toUpperCase() as Chain;
  const live = isLivingRenderCollection(chain, token.contractAddress);
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
    <div className="card-base group relative overflow-hidden flex flex-col w-full">
      {ipType && (
        <div className="absolute top-2 right-2 z-10">
          <IpTypeBadge ipType={ipType as any} size="sm" />
        </div>
      )}

      <Link href={assetHref} className="flex flex-col flex-1">

        <div className="relative aspect-square bg-foreground/[0.04] overflow-hidden shrink-0">
          <AnimatedTokenMedia
            image={image}
            animationUrl={animationUrl}
            live={live}
            alt={name}
            mode="fill"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover"
            fallback={
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/15 to-brand-blue/15" />
            }
          />

          {archived && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
              <Archive className="h-3 w-3" aria-hidden />
              {t("Archived")}
            </span>
          )}

          {(token.metadataStatus === "PENDING" || token.metadataStatus === "FETCHING") && (
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm py-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-white/70" />
              <span className="text-2xs text-white/70">{t("Indexing…")}</span>
            </div>
          )}
        </div>

        <div className="px-3 pt-2.5 pb-4 flex-1 space-y-1">
          <p className="text-base font-bold line-clamp-2 leading-snug">{name}</p>
          {listingOrder && (
            <div className="flex justify-end">
              <PriceDisplay
                amountFormatted={listingOrder.price.formatted}
                currency={listingOrder.price.currency}
                usdValue={usdValue}
                scale="card"
              />
            </div>
          )}
        </div>
      </Link>

      <div className="px-3 pb-3 flex items-center gap-1.5">

        <Link href={assetHref} className={cn(BTN_OUTLINE, "px-2.5", hasPrimaryAction ? "shrink-0" : "flex-1")}>
          <ArrowUpRight className="h-3.5 w-3.5" />
          {t("View")}
        </Link>

        {isOwner ? (
          !listingOrder && onList ? (
            <button
              className={cn(BTN_OUTLINE, "flex-1 text-brand-purple border-brand-purple/30 hover:bg-brand-purple/10 hover:text-brand-purple")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onList(token); }}
            >
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              {t("Sell")}
            </button>
          ) : null
        ) : listingOrder && onBuy ? (
          <div className="btn-border-animated p-[1.5px] rounded-[10px] flex-1 h-8">
            <button
              className="w-full h-full rounded-[9px] bg-background flex items-center justify-center gap-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-all active:scale-[0.98]"
              onClick={handleBuy}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" />
              {t("Buy")}
            </button>
          </div>
        ) : !listingOrder && onOffer ? (
          <button
            className={cn(BTN_OUTLINE, "flex-1 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 hover:text-brand-orange")}
            onClick={handleOffer}
          >
            <HandCoins className="h-3.5 w-3.5 mr-1.5" />
            {t("Offer")}
          </button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(BTN_OUTLINE, "w-8 p-0 shrink-0")}
              aria-label={t("More actions")}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">

            <DropdownMenuItem asChild>
              <Link href={assetHref} className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                {t("View asset")}
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
                    {t("Sell")}
                  </DropdownMenuItem>
                )}
                {onTransfer && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => onTransfer(token)}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("Transfer")}
                  </DropdownMenuItem>
                )}
                {onArchive && token.standard === "ERC721" && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    onClick={() => onArchive(token)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    {t("Permanent archive")}
                  </DropdownMenuItem>
                )}
                {listingOrder && onCancel && (
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-brand-orange focus:text-brand-orange"
                    onClick={() => onCancel(token)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {t("Cancel listing")}
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
                      {t("Buy —")}
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
                    {t("Make offer")}
                  </DropdownMenuItem>
                )}
              </>
            )}

            <DropdownMenuItem asChild>
              <Link href={remixHref} className="flex items-center gap-2 text-brand-purple focus:text-brand-purple">
                <GitBranch className="h-3.5 w-3.5" />
                {t("Remix")}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={collectionHref} className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                {t("View collection")}
              </Link>
            </DropdownMenuItem>

            {profileLink && (
              <DropdownMenuItem asChild>
                <Link href={profileLink.href} className="flex items-center gap-2">
                  <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {profileLink.label}
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
                  {t("Report")}
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
    <div className="card-base overflow-hidden flex flex-col w-full">
      <div className="aspect-square w-full animate-pulse bg-foreground/[0.04]" />
      <div className="px-3 pt-2.5 pb-4 space-y-1">
        <div className="h-5 w-3/4 rounded-md animate-pulse bg-muted" />
        <div className="flex justify-end">
          <div className="h-5 w-16 rounded-md animate-pulse bg-muted" />
        </div>
      </div>
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <div className="h-8 w-[72px] rounded-[9px] animate-pulse bg-muted shrink-0" />
        <div className="h-8 flex-1 rounded-[9px] animate-pulse bg-muted" />
        <div className="h-8 w-8 rounded-[9px] animate-pulse bg-muted shrink-0" />
      </div>
    </div>
  );
}
