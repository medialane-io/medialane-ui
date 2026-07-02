"use client";

import type { ReactNode } from "react";
import {
  ArrowRightLeft, CheckCircle, Clock, GitBranch, HandCoins, Loader2,
  ShoppingCart, Tag, X,
} from "lucide-react";
import { CurrencyIcon, CurrencyAmount } from "./currency-icon.js";
import { AddressDisplay } from "./address-display.js";
import { formatDisplayPrice, parsePriceDisplay } from "../utils/format.js";
import { timeUntil } from "../utils/time.js";

/** Structural subset of `ApiOrder` (both apps' `@medialane/sdk` types satisfy this). */
export interface ApiOrderLike {
  orderHash: string;
  offerer: string;
  endTime: string;
  price: { formatted: string | null; currency: string | null };
}

interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone: "blue" | "orange" | "purple" | "destructive" | "transparent";
  disabled?: boolean;
  helpContent?: string;
  renderHelp: (content: string) => ReactNode;
}

const actionToneClass: Record<ActionButtonProps["tone"], string> = {
  blue: "bg-brand-blue",
  orange: "bg-brand-orange",
  purple: "bg-brand-purple",
  destructive: "bg-destructive",
  transparent: "bg-transparent",
};

function ActionButton({ label, icon, onClick, tone, disabled = false, helpContent, renderHelp }: ActionButtonProps) {
  return (
    <div className={`btn-border-animated p-[1px] rounded-2xl ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <button
        className={`w-full h-10 rounded-[15px] flex items-center justify-center gap-2 px-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 ${actionToneClass[tone]}`}
        disabled={disabled}
        onClick={onClick}
      >
        {icon}
        {label}
        {helpContent ? renderHelp(helpContent) : null}
      </button>
    </div>
  );
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
  /** Raw "0.07 STRK"-style strings — already resolved by the caller. `null`/undefined renders "—". */
  floorPriceRaw?: string | null;
  lastSaleRaw?: string | null;
  /** Renders the sign-in/connect-wallet CTA for the given label (e.g. "Sign in to trade"). */
  renderAuthAction: (label: string) => ReactNode;
  /** Renders an inline help/info affordance for the given tooltip text. */
  renderHelp: (content: string) => ReactNode;
  onCancelClick: (order: T) => void;
  onAcceptBid: (order: T) => void;
  onOpenListing: () => void;
  onOpenTransfer: () => void;
  onOpenPurchase: (order: T) => void;
  onOpenOffer: () => void;
  onOpenRemix?: () => void;
  onProposeDeal?: () => void;
}

function StatRow({ floorPriceRaw, lastSaleRaw }: { floorPriceRaw?: string | null; lastSaleRaw?: string | null }) {
  if (!floorPriceRaw && !lastSaleRaw) return null;
  const floor = floorPriceRaw ? parsePriceDisplay(floorPriceRaw) : null;
  const lastSale = lastSaleRaw ? parsePriceDisplay(lastSaleRaw) : null;
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="uppercase tracking-wider font-semibold">Floor</span>
        {floor && floor.symbol ? (
          <CurrencyAmount amount={floor.numStr} symbol={floor.symbol} iconSize={12} amountClassName="text-foreground font-semibold" />
        ) : (
          <span className="text-foreground font-semibold">—</span>
        )}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="uppercase tracking-wider font-semibold">Last sale</span>
        {lastSale && lastSale.symbol ? (
          <CurrencyAmount amount={lastSale.numStr} symbol={lastSale.symbol} iconSize={12} amountClassName="text-foreground font-semibold" />
        ) : (
          <span className="text-foreground font-semibold">—</span>
        )}
      </span>
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
  floorPriceRaw,
  lastSaleRaw,
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
      {/* soft brand light-leak behind the trade zone — no hard border, per §III */}
      <div
        aria-hidden
        className="aurora-purple pointer-events-none"
        style={{ position: "absolute", width: 280, height: 280, top: -60, left: "20%" }}
      />
      <div className="relative space-y-4">
        {cheapest ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <CurrencyIcon symbol={cheapest.price.currency ?? ""} size={26} />
              <span className="text-4xl font-bold tracking-tight">
                {formatDisplayPrice(cheapest.price.formatted)}
              </span>
              {renderHelp(
                `${isOwner && !canBuyMore ? "Your listing" : "Current price"} · Expires ${timeUntil(cheapest.endTime)}`
              )}
            </div>

            <StatRow floorPriceRaw={floorPriceRaw} lastSaleRaw={lastSaleRaw} />

            {isOwner ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {myListing ? (
                    <ActionButton
                      label="Cancel"
                      icon={isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      onClick={() => onCancelClick(myListing)}
                      disabled={isProcessing}
                      tone="destructive"
                      renderHelp={renderHelp}
                    />
                  ) : null}
                  <ActionButton label="List" icon={<Tag className="h-4 w-4" />} onClick={onOpenListing} tone="blue" renderHelp={renderHelp} />
                  <ActionButton label="Transfer" icon={<ArrowRightLeft className="h-4 w-4" />} onClick={onOpenTransfer} tone="orange" renderHelp={renderHelp} />
                  {remixEnabled && onOpenRemix ? (
                    <ActionButton
                      label="Remix"
                      icon={<GitBranch className="h-4 w-4" />}
                      onClick={onOpenRemix}
                      helpContent="Build a licensed derivative of this digital asset — your remix is minted as a new onchain NFT linked to the original"
                      tone="purple"
                      renderHelp={renderHelp}
                    />
                  ) : null}
                </div>

                {canBuyMore && (
                  <>
                    <div className="border-t border-border/40 pt-2 mt-1" />
                    <div className="grid grid-cols-2 gap-2">
                      <ActionButton label="Buy" icon={<ShoppingCart className="h-4 w-4" />} onClick={() => onOpenPurchase(cheapest!)} tone="transparent" renderHelp={renderHelp} />
                      <ActionButton label="Make offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer} tone="orange" renderHelp={renderHelp} />
                    </div>
                  </>
                )}
              </div>
            ) : isSignedIn ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton label="Buy" icon={<ShoppingCart className="h-4 w-4" />} onClick={() => onOpenPurchase(cheapest)} tone="transparent" renderHelp={renderHelp} />
                  <ActionButton label="Make offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer} tone="orange" renderHelp={renderHelp} />
                  {remixEnabled && onOpenRemix ? (
                    <ActionButton
                      label="Remix"
                      icon={<GitBranch className="h-4 w-4" />}
                      onClick={onOpenRemix}
                      helpContent="Create your own attributed derivative of this work."
                      tone="purple"
                      renderHelp={renderHelp}
                    />
                  ) : null}
                  {showDealOption && onProposeDeal ? (
                    <ActionButton
                      label="License"
                      icon={<HandCoins className="h-4 w-4" />}
                      onClick={onProposeDeal}
                      helpContent="Propose a license deal to the creator to use this work."
                      tone="blue"
                      renderHelp={renderHelp}
                    />
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
                <ActionButton label="List" icon={<Tag className="h-4 w-4" />} onClick={onOpenListing} tone="transparent" renderHelp={renderHelp} />
                <ActionButton label="Transfer" icon={<ArrowRightLeft className="h-4 w-4" />} onClick={onOpenTransfer} tone="orange" renderHelp={renderHelp} />
                {remixEnabled && onOpenRemix ? (
                  <ActionButton
                    label="Remix"
                    icon={<GitBranch className="h-4 w-4" />}
                    onClick={onOpenRemix}
                    helpContent="Build a licensed derivative of this digital asset — your remix is minted as a new onchain NFT linked to the original"
                    tone="purple"
                    renderHelp={renderHelp}
                  />
                ) : null}
              </div>
            ) : isSignedIn ? (
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label="Make offer" icon={<HandCoins className="h-4 w-4" />} onClick={onOpenOffer} tone="orange" renderHelp={renderHelp} />
                {remixEnabled && onOpenRemix ? (
                  <ActionButton
                    label="Remix"
                    icon={<GitBranch className="h-4 w-4" />}
                    onClick={onOpenRemix}
                    helpContent="Build a licensed derivative of this digital asset — your remix is minted as a new onchain NFT linked to the original"
                    tone="purple"
                    renderHelp={renderHelp}
                  />
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
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
