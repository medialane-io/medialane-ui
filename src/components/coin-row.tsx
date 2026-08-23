"use client";

import Link from "./link.js";
import Image from "./image.js";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { DualPrice } from "./dual-price.js";
import {
  coinKind, coinKindLabel, coinAccentToken,
  type CoinCollectionLike, type CoinPriceLike,
} from "../data/coins.js";
import { formatUsdPrice } from "../utils/format.js";

export type CoinMarketStatus = "live" | "pre-launch" | "unavailable";

export type UseCoinPrice = (collection: CoinCollectionLike) => {
  price: CoinPriceLike | null;
  status?: CoinMarketStatus;
  isLoading: boolean;
};

export const COIN_GRID = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4";

export interface CoinRowProps {
  collection: CoinCollectionLike;
  usePrice: UseCoinPrice;
  href: string;
  showKind?: boolean;
}

export function CoinAvatar({ collection, size = 36 }: { collection: CoinCollectionLike; size?: number }) {
  const logoUri = collection.profile?.image ?? collection.image;
  const logo = logoUri ? ipfsToHttp(logoUri) : null;
  const initials = (collection.symbol ?? collection.name ?? "?").trim().slice(0, 2).toUpperCase();
  const accent = coinAccentToken(collection.symbol ?? collection.name ?? collection.contractAddress);

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full", accent)}
      style={{ width: size, height: size }}
    >
      {logo ? (
        <Image src={logo} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-bold leading-none text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function PriceCell({ price, status, isLoading }: { price: CoinPriceLike | null; status?: CoinMarketStatus; isLoading: boolean }) {
  if (isLoading) return <span className="ml-auto block h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />;
  if (!price) {
    return status === "pre-launch" ? (
      <span className="block text-right text-xs text-muted-foreground">Not trading yet</span>
    ) : (
      <span
        className="block text-right text-muted-foreground"
        title="No liquidity route was found for this coin on any Starknet DEX yet."
      >
        —
      </span>
    );
  }

  const usd = price.quoteUsdRate != null ? formatUsdPrice(price.quotePerCoin * price.quoteUsdRate) : null;

  return (
    <span className="flex justify-end">
      <DualPrice
        amountFormatted={String(price.quotePerCoin)}
        currency={price.quoteSymbol}
        usdValue={usd}
        scale="card"
        secondaryClassName="hidden sm:flex"
      />
    </span>
  );
}

export function CoinRow({ collection, usePrice, href, showKind = false }: CoinRowProps) {
  const { price, status, isLoading } = usePrice(collection);

  return (
    <Link
      href={href}
      className={cn(
        COIN_GRID,
        "border-b border-border/40 px-2 py-2.5 text-sm transition-colors",
        "hover:bg-muted/40 active:bg-muted/60"
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <CoinAvatar collection={collection} />
        <span className="min-w-0">
          <span className="block truncate font-semibold leading-tight">{collection.name ?? "Untitled coin"}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {collection.symbol ?? "—"}
            {showKind && <span className="text-muted-foreground/60"> · {coinKindLabel(coinKind(collection.service))}</span>}
          </span>
        </span>
      </span>

      <PriceCell price={price} status={status} isLoading={isLoading} />
    </Link>
  );
}

export function CoinRowSkeleton() {
  return (
    <div className={cn(COIN_GRID, "border-b border-border/40 px-2 py-2.5")}>
      <span className="flex items-center gap-3">
        <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted-foreground/20" />
        <span className="space-y-1.5">
          <span className="block h-4 w-28 animate-pulse rounded bg-muted-foreground/20" />
          <span className="block h-3 w-14 animate-pulse rounded bg-muted-foreground/10" />
        </span>
      </span>
      <span className="ml-auto block h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
    </div>
  );
}
