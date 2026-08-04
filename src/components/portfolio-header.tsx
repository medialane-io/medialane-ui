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

/**
 * Portfolio identity header: the address as a real page title (no generic
 * gradient/avatar element — there's no profile data to lead with, and a
 * placeholder gradient mark isn't the answer), with the rewards journey
 * chip alongside it.
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
