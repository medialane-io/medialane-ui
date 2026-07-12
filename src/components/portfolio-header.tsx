"use client";

import Link from "next/link";
import { Briefcase, Sparkles } from "lucide-react";
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
    <div className="btn-border-animated p-[1.5px] rounded-2xl">
      <div className="rounded-[14px] bg-card px-4 py-2.5 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-brand-blue via-brand-purple to-brand-rose">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-bold gradient-text-full truncate">
            {score.levelName}
          </p>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {score.totalXp.toLocaleString()} XP
          </p>
        </div>
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
