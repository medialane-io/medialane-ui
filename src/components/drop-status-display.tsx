"use client";

import { getListableTokens, normalizeAddress } from "@medialane/sdk";
import { cn } from "../utils/cn.js";
import type { DropConditions, DropStatus } from "../utils/drop-status.js";

function getTokenByAddress(address: string) {
  return (
    getListableTokens().find(
      (t) => normalizeAddress("STARKNET", t.address) === normalizeAddress("STARKNET", address)
    ) ?? null
  );
}

export function DropStatusBadge({ status }: { status: DropStatus }) {
  const map = {
    live:     { label: "Live",     cls: "text-green-400 bg-green-500/10"   },
    upcoming: { label: "Upcoming", cls: "text-brand-blue bg-brand-blue/10"     },
    ended:    { label: "Ended",    cls: "text-muted-foreground bg-muted"   },
    sold_out: { label: "Sold out", cls: "text-brand-orange bg-brand-orange/10" },
  } as const;
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1",
        cls
      )}
    >
      {status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
      {label}
    </span>
  );
}

export function DropSupplyProgress({ minted, max }: { minted: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (minted / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minted.toLocaleString()} minted</span>
        <span>of {max.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-orange transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% claimed</p>
    </div>
  );
}

export function DropPriceDisplay({ conditions }: { conditions: DropConditions }) {
  if (conditions.price === "0" || conditions.paymentToken === "0x0") {
    return (
      <div className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
        Free mint
      </div>
    );
  }
  const token = getTokenByAddress(conditions.paymentToken);
  const decimals = token?.decimals ?? 18;
  const priceNum = Number(BigInt(conditions.price) * 10000n / BigInt(10 ** decimals)) / 10000;
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      {priceNum} {token?.symbol ?? "tokens"} per token
    </div>
  );
}
