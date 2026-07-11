"use client";

import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface CoinPreviewData {
  name: string;
  symbol: string;
  description: string;
  /** Local object URL or resolved IPFS URL for the feature image */
  imageUrl: string | null;
  /** Human supply (already validated) or null while typing */
  supplyHuman: number | null;
  quoteSymbol: string;
  teamPct: number;
}

const LAUNCH_PRICE = 0.01; // fixed, quote per coin

/** Warm coin gradient — rose → orange, the brand's coin palette. */
const COIN_GRADIENT = "linear-gradient(135deg, #f6608f, #fb8b46)";

/** Live preview for the Creator Coin launch studio — builds the coin in front
 *  of the creator as they type. Mirrors the coin's eventual discovery card so
 *  what they design is what their fans will see. Quiet borderless panel in the
 *  launchpad-rail language; the warm coin gradient appears only as the avatar
 *  ring and the allocation bar. */
export function CoinLaunchPreview({ data, className }: { data: CoinPreviewData; className?: string }) {
  const { name, symbol, description, imageUrl, supplyHuman, quoteSymbol, teamPct } = data;
  const marketCap = supplyHuman != null ? supplyHuman * LAUNCH_PRICE : null;
  const yourCoins = supplyHuman != null ? supplyHuman * (teamPct / 100) : null;

  return (
    <div className={cn("rounded-2xl bg-muted/50 dark:bg-card overflow-hidden", className)}>
      <div className="px-5 pt-4">
        <p className="section-label">Live preview</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Identity — avatar in the warm coin ring */}
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-full p-[2px]" style={{ background: COIN_GRADIENT }}>
            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-card flex items-center justify-center">
              {imageUrl ? (
                <Image src={imageUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />
              ) : (
                <TrendingUp className="h-6 w-6 text-brand-rose/70" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn("font-bold text-lg leading-snug truncate", !name && "text-muted-foreground/50")}
              style={{ fontFamily: "var(--font-display, inherit)" }}
            >
              {name || "Your coin"}
            </p>
            <p className="text-sm text-muted-foreground tabular-nums">{symbol ? `$${symbol}` : "$SYMBOL"}</p>
          </div>
        </div>

        {description ? (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
        ) : null}

        {/* Economics */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 dark:bg-muted/30 p-3 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Launch price</p>
            <p className="font-semibold tabular-nums">{LAUNCH_PRICE} {quoteSymbol}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Market cap</p>
            <p className="font-semibold tabular-nums text-brand-price">
              {marketCap != null ? `${marketCap.toLocaleString()} ${quoteSymbol}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Your share</p>
            <p className="font-semibold tabular-nums">
              {yourCoins != null ? `${teamPct}% · ${yourCoins.toLocaleString()}` : `${teamPct}%`}
            </p>
          </div>
        </div>

        {/* Allocation split bar */}
        <div className="space-y-1.5">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted-foreground/15">
            {teamPct > 0 && <div style={{ width: `${teamPct}%`, background: COIN_GRADIENT }} />}
            <div className="flex-1" />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="font-medium text-brand-rose">You {teamPct}%</span>
            <span>Community {100 - teamPct}%</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/70">
          Liquidity is locked forever — nobody can pull it, including us.
        </p>
      </div>
    </div>
  );
}
