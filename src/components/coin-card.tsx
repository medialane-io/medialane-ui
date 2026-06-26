"use client";

/**
 * CoinCard / CoinRow — chain-agnostic, art-forward coin discovery tiles.
 *
 * Pure presentation: the price read (`usePrice`) and the link target (`href`)
 * are injected by the consuming app, and the collection is typed structurally
 * (CoinCollectionLike) — so a coin on Starknet, Ethereum, or Solana renders the
 * same with zero changes here. The coin's artwork is the hero; the whole tile
 * links to the coin page (where trading happens), and the only stat is the live
 * spot price with its quote-currency icon. FDV / holders / a "verified" mark are
 * intentionally not shown — Medialane indexes none of them.
 */

import Link from "next/link";
import Image from "next/image";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { MotionCard } from "./motion-primitives.js";
import { CurrencyIcon } from "./currency-icon.js";
import {
  coinKind, formatCoinPrice,
  type CoinCollectionLike, type CoinPriceLike,
} from "../data/coins.js";

/** Injected per-chain spot-price read. `price` is null while loading/unknown. */
export type UseCoinPrice = (collection: CoinCollectionLike) => {
  price: CoinPriceLike | null;
  isLoading: boolean;
};

export interface CoinTileProps {
  collection: CoinCollectionLike;
  usePrice: UseCoinPrice;
  /** Link target — internal coin page or the per-chain trading app. */
  href: string;
}

// Kind tag on a card surface (table row) — brand hues, never red.
const KIND_TAG: Record<string, string> = {
  creator: "border-brand-blue/30 bg-brand-blue/10 text-brand-blue",
  memecoin: "border-brand-purple/30 bg-brand-purple/10 text-brand-purple",
};
// Kind tag layered over artwork — solid brand pill, white text for legibility.
const KIND_OVER_IMAGE: Record<string, string> = {
  creator: "bg-brand-blue/85 text-white",
  memecoin: "bg-brand-purple/85 text-white",
};
// Art-fallback gradient (no logo) — vivid brand wash.
const KIND_FALLBACK: Record<string, string> = {
  creator: "from-brand-blue to-brand-purple",
  memecoin: "from-brand-purple to-brand-rose",
};

const kindLabel = (kind: string) => (kind === "creator" ? "Creator Coin" : "Memecoin");

function useTileModel({ collection, usePrice }: Omit<CoinTileProps, "href">) {
  const { price, isLoading } = usePrice(collection);
  const kind = coinKind(collection.service);
  const logoUri = collection.profile?.image ?? collection.image;
  const logo = logoUri ? ipfsToHttp(logoUri) : null;
  const initials = (collection.symbol ?? collection.name ?? "?").trim().slice(0, 2).toUpperCase();
  return { price, isLoading, kind, logo, initials };
}

function PriceValue({ price, isLoading }: { price: CoinPriceLike | null; isLoading: boolean }) {
  if (isLoading) return <span className="inline-block h-4 w-14 rounded bg-muted-foreground/20 animate-pulse" />;
  if (!price) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
      <CurrencyIcon symbol={price.quoteSymbol} size={14} />
      {formatCoinPrice(price.quotePerCoin)}
    </span>
  );
}

export function CoinCard({ collection, usePrice, href }: CoinTileProps) {
  const m = useTileModel({ collection, usePrice });
  return (
    <MotionCard className="card-base group relative flex h-full flex-col">
      <Link href={href} className="flex h-full flex-col">
        {/* Hero artwork */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {m.logo ? (
            <Image
              src={m.logo}
              alt={collection.name ?? "Coin"}
              fill
              sizes="(min-width:1280px) 25vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className={cn("absolute inset-0 flex items-center justify-center bg-gradient-to-br", KIND_FALLBACK[m.kind])}>
              <span className="select-none text-5xl font-black tracking-tighter text-white/90">{m.initials}</span>
            </div>
          )}
          <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md", KIND_OVER_IMAGE[m.kind])}>
            {kindLabel(m.kind)}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 p-3">
          <div className="min-w-0">
            <div className="truncate font-semibold leading-tight">{collection.name ?? "Untitled coin"}</div>
            <div className="truncate text-sm text-muted-foreground">{collection.symbol ?? "—"}</div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</span>
            <PriceValue price={m.price} isLoading={m.isLoading} />
          </div>
        </div>
      </Link>
    </MotionCard>
  );
}

export function CoinRow({ collection, usePrice, href }: CoinTileProps) {
  const m = useTileModel({ collection, usePrice });
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 transition-colors hover:border-primary/40 active:scale-[0.99]">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
        {m.logo ? <Image src={m.logo} alt="" fill sizes="36px" className="object-cover" unoptimized /> :
          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br text-[11px] font-bold text-white", KIND_FALLBACK[m.kind])}>{m.initials}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <span className="truncate text-sm font-semibold">{collection.name ?? "Untitled coin"}</span>
        <span className="block truncate text-xs text-muted-foreground">{collection.symbol ?? "—"}</span>
      </div>
      <span className={cn("hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block", KIND_TAG[m.kind])}>
        {kindLabel(m.kind)}
      </span>
      <span className="w-28 shrink-0 text-right text-sm">
        <PriceValue price={m.price} isLoading={m.isLoading} />
      </span>
    </Link>
  );
}

export function CoinCardSkeleton() {
  return (
    <div className="card-base flex flex-col">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-12 rounded bg-muted-foreground/20 animate-pulse" />
        </div>
        <div className="h-4 w-full rounded bg-muted-foreground/10 animate-pulse" />
      </div>
    </div>
  );
}
