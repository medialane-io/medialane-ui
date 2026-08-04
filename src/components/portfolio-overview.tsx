"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioOverviewStat {
  label: string;
  /** Pass null while loading. */
  value: string | number | null;
  sub?: string;
  href?: string;
}

export interface PortfolioQuickAction {
  label: string;
  href: string;
}

export interface PortfolioOverviewProps {
  stats?: PortfolioOverviewStat[];
  /** Shortcut row under the stat tiles ("Create asset", …). */
  quickActions?: PortfolioQuickAction[];
  /**
   * Small/empty portfolio: suppresses the stats+quick-actions row entirely
   * and renders the assets grid full-width. The app computes this from its
   * own asset/pending counts — this component stays presentation-only.
   */
  compact?: boolean;
  /** Recent-assets cards, rendered by the app. */
  assetsSlot?: React.ReactNode;
  assetsHref?: string;
  /** Recent-activity rows, rendered by the app. */
  activitySlot?: React.ReactNode;
  activityHref?: string;
  /** First-run state; rendered instead of the columns when `isEmpty`. */
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

function SectionHeading({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

/**
 * Portfolio landing page layout: one merged stats/quick-actions row, then
 * recent assets/activity columns. Pure presentation — the app injects
 * counts, stats, and rendered cards. Pending-action counts surface via
 * PortfolioNav's badges, not here.
 */
export function PortfolioOverview({
  stats,
  quickActions,
  compact,
  assetsSlot,
  assetsHref,
  activitySlot,
  activityHref,
  isEmpty,
  emptyState,
  className,
}: PortfolioOverviewProps) {
  const hasActivity = Boolean(activitySlot) && !compact;

  return (
    <div className={cn("space-y-6", className)}>
      {!compact && ((stats && stats.length > 0) || (quickActions && quickActions.length > 0)) && (
        <div className="flex items-center gap-2 flex-wrap">
          {stats?.map((stat) => {
            if (stat.value == null) {
              return (
                <span
                  key={stat.label}
                  className="bg-muted rounded-full px-3 py-1.5 w-20 h-7 animate-pulse inline-block"
                />
              );
            }
            const pill = (
              <span className="inline-flex items-baseline gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[13px] whitespace-nowrap">
                <span className="font-semibold text-foreground tabular-nums">
                  {stat.value}
                </span>
                <span className="text-muted-foreground">{stat.label}</span>
                {stat.sub && (
                  <span className="text-muted-foreground/70">
                    · {stat.sub}
                  </span>
                )}
              </span>
            );
            return stat.href ? (
              <Link key={stat.label} href={stat.href} className="active:opacity-80">
                {pill}
              </Link>
            ) : (
              <span key={stat.label}>{pill}</span>
            );
          })}

          {quickActions?.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}

      {isEmpty ? (
        emptyState
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {assetsSlot && (
            <section className={cn("space-y-3", hasActivity ? "lg:col-span-3" : "lg:col-span-5")}>
              <SectionHeading title="Your assets" href={assetsHref} />
              {assetsSlot}
            </section>
          )}
          {hasActivity && (
            <section className="lg:col-span-2 space-y-3">
              <SectionHeading title="Recent activity" href={activityHref} />
              {activitySlot}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
