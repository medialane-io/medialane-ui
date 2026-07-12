"use client";

import Link from "next/link";
import { ArrowRight, BellRing, Plus } from "lucide-react";
import { cn } from "../utils/cn.js";
import { StatTile } from "./stat-tile.js";

export interface PortfolioAttentionItem {
  /** e.g. "2 offers received" — caller composes count + label. */
  label: string;
  /** Short helper line, e.g. "Accept, counter, or decline". */
  description?: string;
  href: string;
  count: number;
  tone?: "destructive" | "warning" | "primary";
}

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
  /** Pending items needing action. The panel renders only when a count > 0. */
  attention?: PortfolioAttentionItem[];
  stats?: PortfolioOverviewStat[];
  /** Shortcut row under the stat tiles ("Create asset", …). */
  quickActions?: PortfolioQuickAction[];
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

const ATTENTION_DOT: Record<
  NonNullable<PortfolioAttentionItem["tone"]>,
  string
> = {
  destructive: "bg-destructive",
  warning: "bg-amber-500",
  primary: "bg-primary",
};

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
 * Portfolio landing page layout: needs-attention panel, clickable stat tiles,
 * and recent assets/activity columns. Pure presentation — the app injects
 * counts, stats, and rendered cards.
 */
export function PortfolioOverview({
  attention,
  stats,
  quickActions,
  assetsSlot,
  assetsHref,
  activitySlot,
  activityHref,
  isEmpty,
  emptyState,
  className,
}: PortfolioOverviewProps) {
  const pending = (attention ?? []).filter((item) => item.count > 0);

  return (
    <div className={cn("space-y-6", className)}>
      {pending.length > 0 && (
        <section className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <BellRing className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Needs your attention</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {pending.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg bg-card border border-border/60 px-3.5 py-2.5 active:opacity-80 hover:border-border transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      ATTENTION_DOT[item.tone ?? "primary"],
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="block text-xs text-muted-foreground truncate">
                        {item.description}
                      </span>
                    )}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat) =>
            stat.href ? (
              <Link key={stat.label} href={stat.href} className="active:opacity-80">
                <StatTile
                  label={stat.label}
                  value={stat.value ?? "—"}
                  sub={stat.sub}
                  big
                  className="h-full"
                />
              </Link>
            ) : (
              <StatTile
                key={stat.label}
                label={stat.label}
                value={stat.value ?? "—"}
                sub={stat.sub}
                big
                className="h-full"
              />
            ),
          )}
        </div>
      )}

      {quickActions && quickActions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground active:opacity-80 hover:border-primary/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
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
            <section className="lg:col-span-3 space-y-3">
              <SectionHeading title="Your assets" href={assetsHref} />
              {assetsSlot}
            </section>
          )}
          {activitySlot && (
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
