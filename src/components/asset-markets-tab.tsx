"use client";

import { AddressDisplay } from "./address-display.js";
import { CurrencyIcon } from "./currency-icon.js";
import { formatDisplayPrice } from "../utils/format.js";
import { isExpired, timeUntil } from "../utils/time.js";
import { isSameAddress } from "../utils/same-address.js";
import { Clock, CheckCircle } from "lucide-react";
import type { ApiOrder } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";
import { Panel } from "./panel.js";
import { ActionButton } from "./action-button.js";

interface AssetMarketsTabProps {
  activeListings: ApiOrder[];
  activeBids: ApiOrder[];
  walletAddress?: string;
  isOwner: boolean;
  isProcessing: boolean;
  onBuyClick: (order: ApiOrder) => void;
  onCancelClick: (order: ApiOrder) => void;
  onAcceptClick: (order: ApiOrder) => void;
}

export function AssetMarketsTab({
  activeListings,
  activeBids,
  walletAddress,
  isOwner,
  isProcessing,
  onBuyClick,
  onCancelClick,
  onAcceptClick,
}: AssetMarketsTabProps) {
  const t = useT();
  const liveListings = activeListings.filter((o) => !isExpired(o.endTime));
  const liveBids = activeBids.filter((o) => !isExpired(o.endTime));

  return (
    <div className="mt-4 space-y-6">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t("Listings")}</p>
        {liveListings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{t("No active listings.")}</p>
        ) : (
          <Panel className="divide-y divide-border/40">
            {liveListings.map((order) => {
              const isMyOrder = isSameAddress(order.offerer, walletAddress);
              return (
                <div key={order.orderHash} className="flex items-center justify-between px-4 py-3 gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-sm inline-flex items-center gap-1.5">
                      {formatDisplayPrice(order.price.formatted)}
                      <CurrencyIcon symbol={order.price.currency ?? ""} size={14} />
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {timeUntil(order.endTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AddressDisplay address={order.offerer} chars={4} showCopy={false} className="text-xs text-muted-foreground" />
                    {isMyOrder ? (
                      <ActionButton className="text-destructive" small disabled={isProcessing} onClick={() => onCancelClick(order)}>
                        {t("Cancel")}
                      </ActionButton>
                    ) : (
                      <ActionButton ring small onClick={() => onBuyClick(order)}>{t("Buy")}</ActionButton>
                    )}
                  </div>
                </div>
              );
            })}
          </Panel>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t("Offers")}</p>
        {liveBids.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{t("No active offers.")}</p>
        ) : (
          <Panel className="divide-y divide-border/40">
            {liveBids.map((bid) => (
              <div key={bid.orderHash} className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      {formatDisplayPrice(bid.price.formatted)}
                      <CurrencyIcon symbol={bid.price.currency ?? ""} size={14} />
                    </span>
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    {timeUntil(bid.endTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AddressDisplay address={bid.offerer} chars={4} showCopy={false} className="text-xs text-muted-foreground" />
                  {isOwner && (
                    <ActionButton small disabled={isProcessing} onClick={() => onAcceptClick(bid)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      {t("Accept")}
                    </ActionButton>
                  )}
                </div>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
}
