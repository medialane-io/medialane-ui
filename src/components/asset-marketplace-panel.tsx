"use client";

import type { ReactNode } from "react";
import {
  ArrowRightLeft, CheckCircle, Clock, GitBranch, HandCoins, Handshake, Loader2,
  ShoppingCart, Tag, X,
} from "lucide-react";
import { CurrencyIcon, CurrencyAmount } from "./currency-icon.js";
import { AddressDisplay } from "./address-display.js";
import { ActionButton } from "./action-button.js";
import { DualPrice } from "./dual-price.js";
import { EmailVerificationGate } from "./email-verification-gate.js";
import { formatDisplayPrice, parsePriceDisplay } from "../utils/format.js";
import { timeUntil } from "../utils/time.js";

export interface ApiOrderLike {
  orderHash: string;
  offerer: string;
  endTime: string;
  price: { formatted: string | null; currency: string | null };
}

export interface AssetMarketplacePanelProps<T extends ApiOrderLike = ApiOrderLike> {
  cheapest?: T;
  isOwner: boolean;
  isSignedIn: boolean;
  isProcessing: boolean;
  isERC1155: boolean;
  isMarketLoading?: boolean;
  myListing: T | null;
  activeBids: T[];
  walletAddress?: string | null;
  remixEnabled?: boolean;
  showDealOption?: boolean;

  usdValue?: string | null;

  renderAuthAction: (label: string) => ReactNode;

  renderHelp: (content: string) => ReactNode;
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

  floorPriceRaw?: string | null;
  lastSaleRaw?: string | null;

  listingRequiresEmailVerification?: boolean;
  settingsHref?: string;
}

function StatRow({ floorPriceRaw, lastSaleRaw }: { floorPriceRaw?: string | null; lastSaleRaw?: string | null }) {
  const floor = floorPriceRaw ? parsePriceDisplay(floorPriceRaw) : null;
  const lastSale = lastSaleRaw ? parsePriceDisplay(lastSaleRaw) : null;
  if (!floor?.symbol && !lastSale?.symbol) return null;
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {floor?.symbol && (
        <span className="flex items-center gap-1.5">
          <span>Floor</span>
          <CurrencyAmount amount={floor.numStr} symbol={floor.symbol} iconSize={12} amountClassName="text-foreground font-semibold" />
        </span>
      )}
      {lastSale?.symbol && (
        <span className="flex items-center gap-1.5">
          <span>Last sale</span>
          <CurrencyAmount amount={lastSale.numStr} symbol={lastSale.symbol} iconSize={12} amountClassName="text-foreground font-semibold" />
        </span>
      )}
    </div>
  );
}

export function AssetMarketplacePanel<T extends ApiOrderLike = ApiOrderLike>({
  cheapest,
  isOwner,
  isSignedIn,
  isProcessing,
  isERC1155,
  isMarketLoading = false,
  myListing,
  activeBids,
  walletAddress,
  remixEnabled = false,
  showDealOption = false,
  showSponsorOption = false,
  onOpenSponsorProposal,
  showSponsorSolicitOption = false,
  onOpenSponsorSolicit,
  floorPriceRaw,
  lastSaleRaw,
  usdValue,
  listingRequiresEmailVerification = false,
  settingsHref = "/settings",
  renderAuthAction,
  renderHelp,
  onCancelClick,
  onAcceptBid,
  onOpenListing,
  onOpenTransfer,
  onOpenPurchase,
  onOpenOffer,
  onOpenRemix,
  onProposeDeal,
}: AssetMarketplacePanelProps<T>) {
  const myBid = !isOwner && walletAddress
    ? activeBids.find((bid) => bid.offerer.toLowerCase() === walletAddress.toLowerCase()) ?? null
    : null;

  const canBuyMore =
    isERC1155 && isOwner && !!cheapest && !!walletAddress &&
    cheapest.offerer.toLowerCase() !== walletAddress.toLowerCase();

  if (isMarketLoading && !cheapest) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">

      <div className="relative space-y-4">
        {cheapest ? (
          <div className="space-y-4">
            <DualPrice
              amountFormatted={cheapest.price.formatted}
              currency={cheapest.price.currency}
              usdValue={usdValue}
              scale="hero"
              trailing={renderHelp(
                `${isOwner && !canBuyMore ? "Your listing" : "Current price"} · Expires ${timeUntil(cheapest.endTime)}`
              )}
            />

            {isOwner ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {myListing ? (
                    <ActionButton big
                      icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      onClick={() => onCancelClick(myListing)}
                      disabled={isProcessing}
                      tone="red"
                      renderHelp={renderHelp}
                    >
                      Cancel Listing
                    </ActionButton>
                  ) : null}

                  {(!myListing || isERC1155) ? (
                    <EmailVerificationGate required={listingRequiresEmailVerification} reason="list assets for sale" settingsHref={settingsHref}>
                      <ActionButton big tone="blue" icon={<Tag className="h-4 w-4" />} onClick={onOpenListing} disabled={listingRequiresEmailVerification} renderHelp={renderHelp}>List on Marketplace</ActionButton>
                    </EmailVerificationGate>
                  ) : null}
                  <ActionButton big tone="orange" icon={<ArrowRightLeft className="h-4 w-4" />} onClick={onOpenTransfer} renderHelp={renderHelp}>Transfer</ActionButton>
                  {remixEnabled && onOpenRemix ? (
                    <ActionButton big
                      action="remix"
                      icon={<GitBranch className="h-4 w-4" />}
                      onClick={onOpenRemix}
                      helpContent="Build a licensed derivative of this digital asset — your remix is minted as a new onchain NFT linked to the original"
                      renderHelp={renderHelp}
                    >
                      Remix
                    </ActionButton>
                  ) : null}
                  {showSponsorSolicitOption && onOpenSponsorSolicit ? (
                    <ActionButton big
                      tone="blue"
                      icon={<Handshake className="h-4 w-4" />}
                      onClick={onOpenSponsorSolicit}
                      helpContent="Let sponsors bid on a license for this asset."
                      renderHelp={renderHelp}
                    >
                      Open for Sponsorship
                    </ActionButton>
                  ) : null}
                </div>

                {canBuyMore && (
                  <>
                    <div className="border-t border-border/40 pt-2 mt-1" />
                    <div className="grid grid-cols-2 gap-2">
                      <ActionButton big action="buy" icon={<ShoppingCart className="h-4 w-4" />} onClick={() => onOpenPurchase(cheapest!)} renderHelp={renderHelp}>Buy</ActionButton>
                      <ActionButton big action="offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer} renderHelp={renderHelp}>Make offer</ActionButton>
                    </div>
                  </>
                )}
              </div>
            ) : isSignedIn ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton big action="buy" icon={<ShoppingCart className="h-4 w-4" />} onClick={() => onOpenPurchase(cheapest)} renderHelp={renderHelp}>Buy</ActionButton>
                  <ActionButton big action="offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer} renderHelp={renderHelp}>Make offer</ActionButton>
                  {remixEnabled && onOpenRemix ? (
                    <ActionButton big
                      action="remix"
                      icon={<GitBranch className="h-4 w-4" />}
                      onClick={onOpenRemix}
                      helpContent="Create your own attributed derivative of this work."
                      renderHelp={renderHelp}
                    >
                      Remix
                    </ActionButton>
                  ) : null}
                  {showDealOption && onProposeDeal ? (
                    <ActionButton big
                      action="license"
                      icon={<HandCoins className="h-4 w-4" />}
                      onClick={onProposeDeal}
                      helpContent="Propose a license deal to the creator to use this work."
                      renderHelp={renderHelp}
                    >
                      License
                    </ActionButton>
                  ) : null}
                  {showSponsorOption && onOpenSponsorProposal ? (
                    <ActionButton big
                      tone="blue"
                      icon={<Handshake className="h-4 w-4" />}
                      onClick={onOpenSponsorProposal}
                      helpContent="Propose to sponsor this creator's work — pay them directly for a license, no escrow."
                      renderHelp={renderHelp}
                    >
                      Sponsor this IP
                    </ActionButton>
                  ) : null}
                </div>
                {!remixEnabled && !showDealOption ? (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    The creator marked this asset as no-derivatives.
                  </p>
                ) : null}
              </>
            ) : (
              renderAuthAction("Sign in to trade")
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <StatRow floorPriceRaw={floorPriceRaw} lastSaleRaw={lastSaleRaw} />
            {isOwner ? (
              <div className="grid grid-cols-2 gap-2">
                <EmailVerificationGate required={listingRequiresEmailVerification} reason="list assets for sale" settingsHref={settingsHref}>
                  <ActionButton big tone="blue" icon={<Tag className="h-4 w-4" />} onClick={onOpenListing} disabled={listingRequiresEmailVerification} renderHelp={renderHelp}>List on Marketplace</ActionButton>
                </EmailVerificationGate>
                <ActionButton big tone="orange" icon={<ArrowRightLeft className="h-4 w-4" />} onClick={onOpenTransfer} renderHelp={renderHelp}>Transfer</ActionButton>
                {remixEnabled && onOpenRemix ? (
                  <ActionButton big
                    action="remix"
                    icon={<GitBranch className="h-4 w-4" />}
                    onClick={onOpenRemix}
                    helpContent="Build a licensed derivative of this digital asset — your remix is minted as a new onchain NFT linked to the original"
                    renderHelp={renderHelp}
                  >
                    Remix
                  </ActionButton>
                ) : null}
                {showSponsorSolicitOption && onOpenSponsorSolicit ? (
                  <ActionButton big
                    tone="blue"
                    icon={<Handshake className="h-4 w-4" />}
                    onClick={onOpenSponsorSolicit}
                    helpContent="Let sponsors bid on a license for this asset."
                    renderHelp={renderHelp}
                  >
                    Open for Sponsorship
                  </ActionButton>
                ) : null}
              </div>
            ) : isSignedIn ? (
              <div className="grid grid-cols-2 gap-2">
                <ActionButton big action="offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer} renderHelp={renderHelp}>Make offer</ActionButton>
                {remixEnabled && onOpenRemix ? (
                  <ActionButton big
                    action="remix"
                    icon={<GitBranch className="h-4 w-4" />}
                    onClick={onOpenRemix}
                    helpContent="Build a licensed derivative of this digital asset — your remix is minted as a new onchain NFT linked to the original"
                    renderHelp={renderHelp}
                  >
                    Remix
                  </ActionButton>
                ) : null}
                {showSponsorOption && onOpenSponsorProposal ? (
                  <ActionButton big
                    tone="blue"
                    icon={<Handshake className="h-4 w-4" />}
                    onClick={onOpenSponsorProposal}
                    helpContent="Propose to sponsor this creator's work — pay them directly for a license, no escrow."
                    renderHelp={renderHelp}
                  >
                    Sponsor this IP
                  </ActionButton>
                ) : null}
              </div>
            ) : (
              renderAuthAction("Sign in to make an offer")
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

        {isOwner && activeBids.length > 0 ? (
          <div className="rounded-xl bg-card/40 p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Incoming offers ({activeBids.length})
            </p>
            <div className="space-y-2">
              {activeBids.map((bid) => (
                <div key={bid.orderHash} className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2">
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
      </div>
    </div>
  );
}
