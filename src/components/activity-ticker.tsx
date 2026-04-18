"use client";

import { useState } from "react";
import Link from "next/link";
import { CurrencyIcon } from "./currency-icon.js";
import { formatDisplayPrice } from "../utils/format.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { cn } from "../utils/cn.js";
import type { ApiOrder } from "@medialane/sdk";

export interface ActivityTickerProps {
  orders: ApiOrder[];
  /** Hide ticker if fewer items than this threshold. Default: 3 */
  minItems?: number;
  className?: string;
}

function ActivityPill({ listing, getHref }: { listing: ApiOrder; getHref: (order: ApiOrder) => string }) {
  const [imgError, setImgError] = useState(false);
  const image = listing.token?.image && !imgError ? ipfsToHttp(listing.token.image) : null;

  return (
    <Link
      href={getHref(listing)}
      className="flex-shrink-0 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 hover:bg-muted/60 active:scale-[0.98] transition-all duration-150 group"
    >
      <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted shrink-0">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-purple/20 to-brand-blue/20" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium whitespace-nowrap max-w-[100px] truncate">
          {listing.token?.name ?? `#${listing.nftTokenId}`}
        </p>
        {listing.price?.formatted && (
          <p className="text-[10px] font-bold text-brand-orange whitespace-nowrap flex items-center gap-0.5">
            {listing.price.currency && <CurrencyIcon symbol={listing.price.currency} size={10} />}
            {formatDisplayPrice(listing.price.formatted)} {listing.price.currency}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ActivityTicker({ orders, minItems = 3, className }: ActivityTickerProps) {
  if (orders.length < minItems) return null;

  const getHref = (order: ApiOrder) => `/asset/${order.nftContract}/${order.nftTokenId}`;

  return (
    <div className={cn(className)}>
      <div className="relative overflow-hidden py-2.5">
        <div
          className="flex gap-2 w-max px-2"
          style={{ animation: "scroll-strip 50s linear infinite" }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
        >
          {[...orders, ...orders].map((listing, i) => (
            <ActivityPill key={`${listing.orderHash}-${i}`} listing={listing} getHref={getHref} />
          ))}
        </div>
      </div>
    </div>
  );
}
