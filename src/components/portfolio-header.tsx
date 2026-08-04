"use client";

import Link from "next/link";
import { cn } from "../utils/cn.js";
import { AddressDisplay } from "./address-display.js";

export interface PortfolioHeaderScore {
  /** Journey level name ("Starter", "Explorer", …) — no numeric level shown. */
  levelName: string;
  totalXp: number;
  /** Where the score chip links ("/rewards"). */
  href?: string;
}

export interface PortfolioHeaderProps {
  address: string;
  score?: PortfolioHeaderScore | null;
  className?: string;
}

/** Deterministic rotation angle from the address, so each wallet gets a
 *  distinct but stable gradient built entirely from existing brand colors. */
function angleFromAddress(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash * 31 + address.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function IdentityMark({ address }: { address: string }) {
  const angle = angleFromAddress(address);
  return (
    <div
      className="h-11 w-11 shrink-0 rounded-2xl"
      style={{
        // Brand palette hardcoded here — this preset defines colors via
        // Tailwind's JS config (no auto-generated CSS custom properties to
        // reference), so `var(--color-brand-*)` isn't available. Keep these
        // three hexes in sync with `preset/tailwind.ts`'s brand-purple/
        // brand-blue/brand-orange if that palette ever changes.
        background: `linear-gradient(${angle}deg, #8a5cf6, #3b7bff 55%, #fb8b46)`,
      }}
      aria-hidden
    />
  );
}

/**
 * Portfolio identity header: a generated identity mark + the address as a
 * real page title (there's no profile/avatar data to lead with instead),
 * with the rewards journey chip alongside it — one cohesive block rather
 * than two disconnected elements at opposite corners.
 */
export function PortfolioHeader({
  address,
  score,
  className,
}: PortfolioHeaderProps) {
  const scoreChip = score && (
    <div className="btn-border-animated p-[1.5px] rounded-full">
      <div className="rounded-full bg-card px-3.5 py-1.5 flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-sm font-semibold text-foreground">
          {score.levelName}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {score.totalXp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        <IdentityMark address={address} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Portfolio
          </p>
          <AddressDisplay
            address={address}
            chars={6}
            className="text-xl font-bold tracking-tight text-foreground"
          />
        </div>
      </div>
      {score?.href ? (
        <Link href={score.href} className="shrink-0 active:opacity-80">
          {scoreChip}
        </Link>
      ) : (
        <div className="shrink-0">{scoreChip}</div>
      )}
    </div>
  );
}
