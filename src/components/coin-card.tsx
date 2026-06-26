"use client";

/**
 * CoinCard / CoinRow — chain-agnostic, art-forward coin discovery tiles.
 *
 * Pure presentation: the price read (`usePrice`) and the link target (`href`)
 * are injected by the consuming app, and the collection is typed structurally
 * (CoinCollectionLike) — so a coin on Starknet, Ethereum, or Solana renders the
 * same with zero changes here. The coin's artwork is the hero; the only stat is
 * the live spot price (FDV / holders / a "verified" mark are intentionally not
 * shown — Medialane indexes none of them).
 */

import Link from "next/link";
import Image from "next/image";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { MotionCard } from "./motion-primitives.js";
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

const KIND_TAG: Record<string, string> = {
  creator: "border-brand-purple/30 bg-brand-purple/10 text-brand-purple",
  memecoin: "border-brand-rose/30 bg-brand-rose/10 text-brand-rose",
};

// Aurora glow + art-fallback gradient, tinted by kind (foundations §III: rose
// is the coin surface, purple/blue the creator accent).
const KIND_GLOW: Record<string, string> = {
  creator: "bg-brand-purple/25",
  memecoin: "bg-brand-rose/25",
};
const KIND_FALLBACK: Record<string, string> = {
  creator: "from-brand-blue to-brand-purple",
  memecoin: "from-brand-purple to-brand-rose",
};

function useTileModel({ collection, usePrice }: Omit<CoinTileProps, "href">) {
  const { price, isLoading } = usePrice(collection);
  const kind = coinKind(collection.service);
  const logoUri = collection.profile?.image ?? collection.image;
  const logo = logoUri ? ipfsToHttp(logoUri) : null;
  const initials = (collection.symbol ?? collection.name ?? "?").trim().slice(0, 2).toUpperCase();
  const chain = (collection.chain ?? "").toString().toLowerCase();
  return { price, isLoading, kind, logo, initials, chain };
}

function PriceSkel() {
  return <span className="inline-block h-4 w-14 rounded bg-muted-foreground/20 animate-pulse" />;
}

function KindChip({ kind, className }: { kind: string; className?: string }) {
  return (
    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", KIND_TAG[kind], className)}>
      {kind === "creator" ? "Creator Coin" : "Memecoin"}
    </span>
  );
}

export function CoinCard({ collection, usePrice, href }: CoinTileProps) {
  const m = useTileModel({ collection, usePrice });
  return (
    <div className="group relative h-full">
      {/* Aurora glow — soft, kind-tinted, blooms past the card edge. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-2 rounded-[1.4rem] opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100",
          KIND_GLOW[m.kind]
        )}
      />
      <MotionCard className="card-base relative flex h-full flex-col">
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
            {m.chain && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white/80 backdrop-blur-md">
                {m.chain}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col gap-3 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-semibold leading-tight">{collection.name ?? "Untitled coin"}</div>
                <div className="truncate text-sm text-muted-foreground">{collection.symbol ?? "—"}</div>
              </div>
              <KindChip kind={m.kind} />
            </div>
            <div className="mt-auto space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</span>
                {m.isLoading ? <PriceSkel /> : m.price ? (
                  <span className="font-semibold tabular-nums">{formatCoinPrice(m.price.quotePerCoin)}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <span className="block rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple px-3 py-2 text-center text-sm font-semibold text-white">
                Trade
              </span>
            </div>
          </div>
        </Link>
      </MotionCard>
    </div>
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
      <KindChip kind={m.kind} className="hidden sm:inline-block" />
      <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
        {m.isLoading ? <span className="ml-auto inline-block h-4 w-12 rounded bg-muted-foreground/20 animate-pulse" /> : m.price ? formatCoinPrice(m.price.quotePerCoin) : <span className="text-muted-foreground">—</span>}
      </span>
      <span className="hidden shrink-0 text-sm font-medium text-primary sm:inline-block">Trade</span>
    </Link>
  );
}

export function CoinCardSkeleton() {
  return (
    <div className="card-base flex flex-col">
      <div className="aspect-square w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-3">
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-12 rounded bg-muted-foreground/20 animate-pulse" />
        </div>
        <div className="h-9 w-full rounded-lg bg-muted-foreground/10 animate-pulse" />
      </div>
    </div>
  );
}
