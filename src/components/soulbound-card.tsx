"use client";

import { Fingerprint } from "lucide-react";
import { profileHref, type ApiActivity } from "@medialane/sdk";
import Link from "./link.js";
import { shortenAddress } from "../utils/address.js";

export function issuedAt(history: readonly ApiActivity[]): string | null {
  const times = history
    .filter((event) => event.type === "mint")
    .map((event) => new Date(event.timestamp).getTime())
    .filter((time) => Number.isFinite(time));
  if (times.length === 0) return null;
  return new Date(Math.min(...times)).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function SoulboundBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-2xs font-semibold text-brand-purple backdrop-blur-md">
      <Fingerprint className="h-3 w-3" aria-hidden />
      Soulbound
    </span>
  );
}

export interface SoulboundCardProps {
  history?: readonly ApiActivity[];
  ownerAddress?: string | null;
}

export function SoulboundCard({ history = [], ownerAddress }: SoulboundCardProps) {
  const issued = issuedAt(history);
  return (
    <section aria-label="Soulbound asset" className="flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-muted/40 to-transparent p-4">
      <Fingerprint className="h-7 w-7 shrink-0 text-brand-purple" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold leading-tight text-foreground">Soulbound</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {ownerAddress ? (
            <>
              Permanently bound to{" "}
              <Link href={profileHref({ address: ownerAddress })} title={ownerAddress} className="font-mono font-medium text-foreground transition-colors hover:text-primary">
                {shortenAddress(ownerAddress)}
              </Link>
            </>
          ) : (
            "Permanently bound to the wallet it was issued to."
          )}
        </p>
      </div>
      {issued ? (
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Issued</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{issued}</p>
        </div>
      ) : null}
    </section>
  );
}
