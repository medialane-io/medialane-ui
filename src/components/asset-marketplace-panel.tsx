"use client";

import { Children, type ReactNode } from "react";
import {
  ArrowRightLeft, CheckCircle, Clock, GitBranch, HandCoins, Handshake, Loader2,
  Tag, X,
} from "lucide-react";
import { PriceDisplay } from "./price-display.js";
import { AddressDisplay } from "./address-display.js";
import { ActionButton } from "./action-button.js";
import { isExpired, timeUntil } from "../utils/time.js";
import { isSameAddress } from "../utils/same-address.js";
import { cn } from "../utils/cn.js";
import { HelpIcon } from "./help-icon.js";
import { AssetAccessButtons, CompanionAppButton } from "./asset-access-cards.js";
import { useMedialaneApp, type AssetRef } from "./medialane-app.js";
import { useT } from "../i18n/provider.js";
import { Panel } from "./panel.js";

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
    <PriceDisplay
      amountFormatted={order.price.formatted}
      currency={order.price.currency}
      usdValue={usdValue}
      scale="hero"
      trailing={<HelpIcon content={`Expires ${timeUntil(order.endTime)}`} />}
    />
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
  const t = useT();
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
        <div className="h-9 w-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const remixButton = remixEnabled && onOpenRemix ? (
    <ActionButton
      icon={<GitBranch className="h-4 w-4" />}
      onClick={onOpenRemix}
      helpContent="Create your own attributed derivative of this work."
    >
      {t("Remix")}
    </ActionButton>
  ) : null;

  const offerButton = (
    <ActionButton icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer}>
      {t("Make offer")}
    </ActionButton>
  );

  const buyButton = liveCheapest && (!isOwner || canBuyMore) ? (
    <ActionButton ring onClick={() => onOpenPurchase(liveCheapest)}>
      {t("Buy now")}
    </ActionButton>
  ) : null;

  const listedPrice = !isOwner && liveCheapest ? <PriceBlock order={liveCheapest} usdValue={usdValue} /> : null;

  return (
    <div className="relative">

      <div className="relative space-y-4">
        {isOwner ? (
          <div className="space-y-4">
            {liveMyListing ? (
              <PriceBlock
                order={liveMyListing}
                usdValue={liveMyListing.orderHash === liveCheapest?.orderHash ? usdValue : null}
              />
            ) : null}
            <ActionRow>
              {liveMyListing ? (
                <ActionButton
                  icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  onClick={() => onCancelClick(liveMyListing)}
                  disabled={isProcessing}
                  helpContent={`Expires ${timeUntil(liveMyListing.endTime)}`}
                >
                  {t("Cancel listing")}
                </ActionButton>
              ) : null}
              {!liveMyListing || (isERC1155 && canListMoreEditions !== false) ? (
                <ActionButton icon={<Tag className="h-4 w-4" />} onClick={onOpenListing}>
                  {liveMyListing ? t("Sell more") : t("Sell")}
                </ActionButton>
              ) : null}
              <ActionButton icon={<ArrowRightLeft className="h-4 w-4" />} onClick={onOpenTransfer}>{t("Transfer")}</ActionButton>
              {remixButton}
              {showSponsorSolicitOption && onOpenSponsorSolicit ? (
                <ActionButton
                  icon={<Handshake className="h-4 w-4" />}
                  onClick={onOpenSponsorSolicit}
                  helpContent="Let sponsors bid on a license for this asset."
                >
                  {t("Open for sponsorship")}
                </ActionButton>
              ) : null}
            </ActionRow>
            {buyButton && liveCheapest ? (
              <div className="space-y-4">
                <PriceBlock order={liveCheapest} usdValue={usdValue} />
                <ActionRow>{buyButton}</ActionRow>
              </div>
            ) : null}
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
                    icon={<HandCoins className="h-4 w-4" />}
                    onClick={onProposeDeal}
                    helpContent="Propose a license deal to the creator to use this work."
                  >
                    {t("License")}
                  </ActionButton>
                ) : null}
                {showSponsorOption && onOpenSponsorProposal ? (
                  <ActionButton
                    icon={<Handshake className="h-4 w-4" />}
                    onClick={onOpenSponsorProposal}
                    helpContent="Propose to sponsor this creator's work — pay them directly for a license, no escrow."
                  >
                    {t("Sponsor")}
                  </ActionButton>
                ) : null}
              </ActionRow>
            ) : (
              <AssetAccessButtons asset={asset} stacked={compact} />
            )}
          </div>
        )}

        {myBid ? (
          <Panel tone="orange" className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2.5">
              <HandCoins className="h-4 w-4 text-brand-orange shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-orange">{t("Your active offer")}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <PriceDisplay amountFormatted={myBid.price.formatted} currency={myBid.price.currency} scale="row" />
                  <span>·</span>
                  <Clock className="h-3 w-3" />
                  {timeUntil(myBid.endTime)}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 text-xs font-semibold text-brand-rose hover:opacity-80 transition-opacity flex items-center gap-1"
              onClick={() => onCancelClick(myBid)}
            >
              <X className="h-3.5 w-3.5" />
              {t("Cancel")}
            </button>
          </Panel>
        ) : null}

        {isOwner && liveBids.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{t("Incoming offers ({count})", { count: liveBids.length })}</p>
            <div className="divide-y divide-border/40">
              {liveBids.map((bid) => (
                <div key={bid.orderHash} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      <PriceDisplay amountFormatted={bid.price.formatted} currency={bid.price.currency} scale="row" />
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
                  <ActionButton small icon={<CheckCircle className="h-3.5 w-3.5" />} disabled={isProcessing} onClick={() => onAcceptBid(bid)}>
                    {t("Accept")}
                  </ActionButton>
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
