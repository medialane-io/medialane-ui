"use client";

import { cn } from "../../utils/cn.js";
import type { DropPhase } from "../../utils/drop/view.js";

export function DropStatusBadge({ phase }: { phase: DropPhase }) {
  const map = {
    live:       { label: "Live",     cls: "text-green-400 bg-green-500/10" },
    upcoming:   { label: "Upcoming", cls: "text-brand-blue bg-brand-blue/10" },
    ended:      { label: "Ended",    cls: "text-muted-foreground bg-muted" },
    "sold-out": { label: "Sold out", cls: "text-brand-orange bg-brand-orange/10" },
  } as const;
  const { label, cls } = map[phase];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1", cls)}>
      {phase === "live" && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />}
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
