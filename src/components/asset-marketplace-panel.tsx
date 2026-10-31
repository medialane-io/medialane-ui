"use client";

import { Children, type ReactNode } from "react";
import {
  ArrowRightLeft, CheckCircle, Clock, GitBranch, HandCoins, Handshake, Loader2,
  Tag, X,
} from "lucide-react";
import { CurrencyIcon, CurrencyAmount } from "./currency-icon.js";
import { AddressDisplay } from "./address-display.js";
import { ActionButton } from "./action-button.js";
import { formatDisplayPrice } from "../utils/format.js";
import { isExpired, timeUntil } from "../utils/time.js";
import { isSameAddress } from "../utils/same-address.js";
import { cn } from "../utils/cn.js";
import { HelpIcon } from "./help-icon.js";
import { AssetAccessButtons, CompanionAppButton } from "./asset-access-cards.js";
import { useMedialaneApp, type AssetRef } from "./medialane-app.js";

export interface ApiOrderLike {
  orderHash: string;
  offerer: string;
  endTime: string;
  price: { formatted: string | null; currency: string | null };
}

export interface AssetMarketplacePanelProps<T extends ApiOrderLike = ApiOrderLike> {
  asset: AssetRef;
  compact?: boolean;
  cheapest?: T;
  isOwner: boolean;
  isProcessing: boolean;
  isERC1155: boolean;
  canListMoreEditions?: boolean;
  isMarketLoading?: boolean;
  myListing: T | null;
  activeBids: T[];
  remixEnabled?: boolean;
  showDealOption?: boolean;

  usdValue?: string | null;

  onCancelClick: (order: T) => void;
  onAcceptBid: (order: T) => void;
  onOpenListing: () => void;
  onOpenTransfer: () => void;
  onOpenPurchase: (order: T) => void;
  onOpenOffer: () => void;
  onOpenRemix?: () => void;
  onProposeDeal?: () => void;

  showSponsorOption?: boolean;
  onOpenSponsorProposal?: () => void;

  showSponsorSolicitOption?: boolean;
  onOpenSponsorSolicit?: () => void;


}

function ActionRow({ children }: { children: ReactNode }) {
  const odd = Children.toArray(children).length % 2 === 1;
  return <div className={cn("grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:[&>*]:min-w-36", odd && "[&>*:first-child]:col-span-2")}>{children}</div>;
}

function PriceBlock({ order, usdValue }: { order: ApiOrderLike; usdValue?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <CurrencyAmount amount={formatDisplayPrice(order.price.formatted)} symbol={order.price.currency ?? ""} iconSize={26} amountClassName="text-3xl font-bold text-foreground tabular-nums" />
      <span className="text-lg font-semibold text-foreground">{order.price.currency}</span>
      {usdValue ? <span className="text-sm tabular-nums text-muted-foreground">{usdValue}</span> : null}
      <HelpIcon content={`Expires ${timeUntil(order.endTime)}`} />
    </div>
  );
}

export function AssetMarketplacePanel<T extends ApiOrderLike = ApiOrderLike>({
  asset,
  compact = false,
  cheapest,
  isOwner,
  isProcessing,
  isERC1155,
  canListMoreEditions,
  isMarketLoading = false,
  myListing,
  activeBids,
  remixEnabled = false,
  showDealOption = false,
  showSponsorOption = false,
  onOpenSponsorProposal,
  showSponsorSolicitOption = false,
  onOpenSponsorSolicit,
  usdValue,
  onCancelClick,
  onAcceptBid,
  onOpenListing,
  onOpenTransfer,
  onOpenPurchase,
  onOpenOffer,
  onOpenRemix,
  onProposeDeal,
}: AssetMarketplacePanelProps<T>) {
  const { walletAddress } = useMedialaneApp();
  const isSignedIn = !!walletAddress;
  const liveBids = activeBids.filter((bid) => !isExpired(bid.endTime));
  const liveCheapest = cheapest && !isExpired(cheapest.endTime) ? cheapest : undefined;
  const liveMyListing = myListing && !isExpired(myListing.endTime) ? myListing : null;

  const myBid = !isOwner && walletAddress
    ? liveBids.find((bid) => isSameAddress(bid.offerer, walletAddress)) ?? null
    : null;

  const canBuyMore =
    isERC1155 && isOwner && !!liveCheapest && !!walletAddress &&
    !isSameAddress(liveCheapest.offerer, walletAddress);

  if (isMarketLoading && !liveCheapest) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const remixButton = remixEnabled && onOpenRemix ? (
    <ActionButton
      action="remix"
      icon={<GitBranch className="h-4 w-4" />}
      onClick={onOpenRemix}
      helpContent="Create your own attributed derivative of this work."
    >
      Remix
    </ActionButton>
  ) : null;

  const offerButton = (
    <ActionButton action="offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer}>
      Make offer
    </ActionButton>
  );

  const buyButton = liveCheapest && (!isOwner || canBuyMore) ? (
    isOwner ? (
      <ActionButton action="buy" onClick={() => onOpenPurchase(liveCheapest)}>
        <span>Buy</span>
        <CurrencyAmount amount={formatDisplayPrice(liveCheapest.price.formatted)} symbol={liveCheapest.price.currency ?? ""} iconSize={14} amountClassName="tabular-nums" />
        {usdValue ? <span className="font-normal text-muted-foreground tabular-nums">· {usdValue}</span> : null}
      </ActionButton>
    ) : (
      <ActionButton action="buy" onClick={() => onOpenPurchase(liveCheapest)}>
        Buy now
      </ActionButton>
    )
  ) : null;

  const listedPrice = !isOwner && liveCheapest ? <PriceBlock order={liveCheapest} usdValue={usdValue} /> : null;

  return (
    <div className="relative">

      <div className="relative space-y-4">
        {isOwner ? (
          <div className="space-y-3">
            <ActionRow>
              {liveMyListing ? (
                <ActionButton
                  icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  onClick={() => onCancelClick(liveMyListing)}
                  disabled={isProcessing}
                  tone="red"
                  helpContent={`Expires ${timeUntil(liveMyListing.endTime)}`}
                >
                  <span>Cancel listing</span>
                  <CurrencyAmount amount={formatDisplayPrice(liveMyListing.price.formatted)} symbol={liveMyListing.price.currency ?? ""} iconSize={14} amountClassName="tabular-nums" />
                  {liveMyListing.orderHash === liveCheapest?.orderHash && usdValue ? <span className="font-normal text-muted-foreground tabular-nums">· {usdValue}</span> : null}
                </ActionButton>
              ) : null}
              {!liveMyListing || (isERC1155 && canListMoreEditions !== false) ? (
                <ActionButton tone="blue" icon={<Tag className="h-4 w-4" />} onClick={onOpenListing}>
                  {liveMyListing ? "List more" : "List for sale"}
                </ActionButton>
              ) : null}
              <ActionButton tone="orange" icon={<ArrowRightLeft className="h-4 w-4" />} onClick={onOpenTransfer}>Transfer</ActionButton>
              {remixButton}
              {showSponsorSolicitOption && onOpenSponsorSolicit ? (
                <ActionButton
                  tone="blue"
                  icon={<Handshake className="h-4 w-4" />}
                  onClick={onOpenSponsorSolicit}
                  helpContent="Let sponsors bid on a license for this asset."
                >
                  Open for sponsorship
                </ActionButton>
              ) : null}
            </ActionRow>
            {buyButton ? <ActionRow>{buyButton}</ActionRow> : null}
          </div>
        ) : (
          <div className="space-y-4">
            {listedPrice}
            {isSignedIn ? (
              <ActionRow>
                {buyButton}
                {offerButton}
                {remixButton}
                {showDealOption && onProposeDeal ? (
                  <ActionButton
                    action="license"
                    icon={<HandCoins className="h-4 w-4" />}
                    onClick={onProposeDeal}
                    helpContent="Propose a license deal to the creator to use this work."
                  >
                    License
                  </ActionButton>
                ) : null}
                {showSponsorOption && onOpenSponsorProposal ? (
                  <ActionButton
                    tone="blue"
                    icon={<Handshake className="h-4 w-4" />}
                    onClick={onOpenSponsorProposal}
                    helpContent="Propose to sponsor this creator's work — pay them directly for a license, no escrow."
                  >
                    Sponsor
                  </ActionButton>
                ) : null}
              </ActionRow>
            ) : (
              <AssetAccessButtons asset={asset} stacked={compact} />
            )}
          </div>
        )}

        {myBid ? (
          <div className="rounded-xl bg-amber-500/8 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2.5">
              <HandCoins className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-500">Your active offer</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-foreground inline-flex items-center gap-1">
                    {formatDisplayPrice(myBid.price.formatted)}
                    <CurrencyIcon symbol={myBid.price.currency ?? ""} size={12} />
                  </span>
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  {timeUntil(myBid.endTime)}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              onClick={() => onCancelClick(myBid)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        ) : null}

        {isOwner && liveBids.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Incoming offers ({liveBids.length})
            </p>
            <div className="divide-y divide-border/40">
              {liveBids.map((bid) => (
                <div key={bid.orderHash} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        {formatDisplayPrice(bid.price.formatted)}
                        <CurrencyIcon symbol={bid.price.currency ?? ""} size={14} />
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <AddressDisplay address={bid.offerer} chars={4} showCopy={false} className="text-xs text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">·</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeUntil(bid.endTime)}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={isProcessing}
                    onClick={() => onAcceptBid(bid)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {isSignedIn ? <CompanionAppButton asset={asset} variant="link" /> : null}
      </div>
    </div>
  );
}
