"use client";

/**
 * CoinCard / CoinRow — chain-agnostic coin discovery tiles.
 *
 * Pure presentation: the price read (`usePrice`) and the link target (`href`)
 * are injected by the consuming app, and the collection is typed structurally
 * (CoinCollectionLike) — so a coin on Starknet, Ethereum, or Solana renders the
 * same with zero changes here. `chain` is shown as a badge.
 */

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Users } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import {
  coinKind, formatCoinPrice, formatFdv,
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

function useTileModel({ collection, usePrice }: Omit<CoinTileProps, "href">) {
  const { price, isLoading } = usePrice(collection);
  const kind = coinKind(collection.service);
  const verified = collection.claimedBy != null || kind === "creator";
  const logoUri = collection.profile?.image ?? collection.image;
  const logo = logoUri ? ipfsToHttp(logoUri) : null;
  const initials = (collection.symbol ?? collection.name ?? "?").trim().slice(0, 2).toUpperCase();
  const fdv = formatFdv(price?.quotePerCoin, collection.totalSupply, price?.quoteSymbol ?? null);
  const chain = (collection.chain ?? "").toString().toLowerCase();
  return { price, isLoading, kind, verified, logo, initials, fdv, chain };
}

function PriceSkel({ wide }: { wide?: boolean }) {
  return <span className={cn("inline-block h-4 rounded bg-muted-foreground/20 animate-pulse", wide ? "w-16" : "w-12")} />;
}

export function CoinCard({ collection, usePrice, href }: CoinTileProps) {
  const m = useTileModel({ collection, usePrice });
  return (
    <Link href={href} className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden transition-transform active:scale-[0.99]">
      <div className="flex items-center gap-3 p-4">
        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden bg-muted">
          {m.logo ? (
            <Image src={m.logo} alt="" fill sizes="48px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue to-brand-purple text-sm font-bold text-white">{m.initials}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-semibold">{collection.name ?? "Untitled coin"}</span>
            {m.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified" />}
          </div>
          <span className="text-sm text-muted-foreground">{collection.symbol ?? "—"}</span>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", KIND_TAG[m.kind])}>
          {m.kind === "creator" ? "Creator Coin" : "Memecoin"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-border/60 px-4 py-3 text-sm">
        <Stat label="Price">
          {m.isLoading ? <PriceSkel /> : m.price ? <span className="font-semibold">{formatCoinPrice(m.price.quotePerCoin)}</span> : <span className="text-muted-foreground">—</span>}
        </Stat>
        <Stat label="FDV">
          {m.isLoading ? <PriceSkel /> : <span className="font-semibold">{m.fdv ?? "—"}</span>}
        </Stat>
        <Stat label="Holders">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Users className="h-3 w-3 text-muted-foreground" />{collection.holderCount || "—"}
          </span>
        </Stat>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-sm">
        {m.chain ? <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.chain}</span> : <span />}
        <span className="font-medium text-primary">Trade</span>
      </div>
    </Link>
  );
}

export function CoinRow({ collection, usePrice, href }: CoinTileProps) {
  const m = useTileModel({ collection, usePrice });
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 transition-colors hover:border-primary/40">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
        {m.logo ? <Image src={m.logo} alt="" fill sizes="36px" className="object-cover" unoptimized /> :
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue to-brand-purple text-[11px] font-bold text-white">{m.initials}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold">{collection.name ?? "Untitled coin"}</span>
          {m.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verified" />}
        </div>
        <span className="text-xs text-muted-foreground">{collection.symbol ?? "—"}</span>
      </div>
      <span className={cn("hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block", KIND_TAG[m.kind])}>
        {m.kind === "creator" ? "Creator Coin" : "Memecoin"}
      </span>
      <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
        {m.isLoading ? <span className="ml-auto inline-block h-4 w-12 rounded bg-muted-foreground/20 animate-pulse" /> : m.price ? formatCoinPrice(m.price.quotePerCoin) : <span className="text-muted-foreground">—</span>}
      </span>
      <span className="hidden shrink-0 text-sm font-medium text-primary sm:inline-block">Trade</span>
    </Link>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function CoinCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-12 rounded bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-border/60 px-4 py-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-8 w-full rounded bg-muted-foreground/10 animate-pulse" />)}
      </div>
      <div className="h-9 w-full bg-muted-foreground/10 animate-pulse" />
    </div>
  );
}
