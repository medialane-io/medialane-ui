"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { cn } from "../utils/cn.js";
import { AddressDisplay } from "./address-display.js";

export interface PortfolioHeaderStat {
  label: string;
  /** Pass null while loading — renders a pulse placeholder. */
  value: string | number | null;
  href?: string;
  /** Primary-tinted chip for counts that need action (e.g. offers received). */
  highlight?: boolean;
}

export interface PortfolioHeaderScore {
  level: number;
  levelName: string;
  badgeColor: string;
  totalXp: number;
  /** Where the score chip links ("/rewards"). */
  href?: string;
}

export interface PortfolioHeaderProps {
  address: string;
  stats?: PortfolioHeaderStat[];
  score?: PortfolioHeaderScore | null;
  className?: string;
}

function StatChip({ stat }: { stat: PortfolioHeaderStat }) {
  if (stat.value == null) {
    return (
      <span className="bg-muted rounded-full px-3 py-1 w-20 h-6 animate-pulse inline-block" />
    );
  }
  const body = (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
        stat.highlight
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
      )}
    >
      <span className="tabular-nums font-semibold text-foreground/90">
        {stat.value}
      </span>
      {stat.label}
    </span>
  );
  if (!stat.href) return body;
  return (
    <Link href={stat.href} className="active:opacity-80">
      {body}
    </Link>
  );
}

/**
 * Compact single-block portfolio header: eyebrow + address on the left, a
 * level/XP score chip on the right, and a row of stat chips beneath. Replaces
 * the stacked identity / stat-pills / ScoreSummaryCard blocks.
 */
export function PortfolioHeader({
  address,
  stats,
  score,
  className,
}: PortfolioHeaderProps) {
  const scoreChip = score && (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2">
      <div
        className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-black text-white"
        style={{ backgroundColor: score.badgeColor }}
      >
        {score.level}
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-xs font-bold text-foreground truncate">
          {score.levelName}
        </p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {score.totalXp.toLocaleString()} XP
        </p>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start justify-between gap-4">
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
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {stats.map((stat, i) => (
            <StatChip key={i} stat={stat} />
          ))}
        </div>
      )}
    </div>
  );
}
