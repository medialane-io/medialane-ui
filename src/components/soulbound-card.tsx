"use client";

import { Lock } from "lucide-react";
import type { ApiActivity } from "@medialane/sdk";

export function issuedAt(history: readonly ApiActivity[]): string | null {
  const times = history
    .filter((event) => event.type === "mint")
    .map((event) => new Date(event.timestamp).getTime())
    .filter((time) => Number.isFinite(time));
  if (times.length === 0) return null;
  return new Date(Math.min(...times)).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export interface SoulboundCardProps {
  history?: readonly ApiActivity[];
}

export function SoulboundCard({ history = [] }: SoulboundCardProps) {
  const issued = issuedAt(history);
  return (
    <section aria-label="Soulbound asset" className="flex items-center gap-4 rounded-2xl bg-card/60 p-4 backdrop-blur-sm">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-purple/15 dark:bg-brand-purple/25">
        <Lock className="h-5 w-5 text-brand-purple" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-sm font-bold text-foreground">Soulbound</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Permanently bound to the wallet it was issued to.</p>
      </div>
      {issued ? <p className="shrink-0 text-xs text-muted-foreground">Issued {issued}</p> : null}
    </section>
  );
}
