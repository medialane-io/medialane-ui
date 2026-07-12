"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
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
 * Compact portfolio header: eyebrow + address on the left, the rewards
 * journey chip on the right — level name + XP inside the animated
 * full-spectrum brand border (`.btn-border-animated`). Counts live in the
 * Overview stat tiles, not here.
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
    <div
      className={cn("flex items-start justify-between gap-4", className)}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 text-primary">
          <Briefcase className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Portfolio
          </span>
        </div>
        <AddressDisplay address={address} chars={6} className="text-sm" />
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
