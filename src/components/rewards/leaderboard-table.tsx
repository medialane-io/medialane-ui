import type { ReactNode } from "react";
import { cn } from "../../utils/cn.js";
import { shortenAddress } from "../../utils/address.js";
import { LevelBadge } from "./level-badge.js";

export interface LeaderboardEntryLike {

  rank: number;
  address: string;
  publicId?: string | null;
  totalXp: number;
  currentLevel: number;
  currentLevelName: string;
  badgeColor: string;
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntryLike[];

  highlightAddress?: string | null;

  renderAddress?: (address: string) => ReactNode;
  className?: string;
}

export function LeaderboardTable({ entries, highlightAddress, renderAddress, className }: LeaderboardTableProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {entries.map((e) => {
        const isViewer = highlightAddress != null && e.address === highlightAddress;
        return (
          <div
            key={e.address}
            className={cn(
              "flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors",
              isViewer ? "bg-brand-rose/10" : "bg-foreground/[0.04] hover:bg-foreground/[0.07]"
            )}
          >
            <span className="min-w-0 flex-1 truncate text-base font-bold">
              {renderAddress ? renderAddress(e.address) : shortenAddress(e.address)}
              {isViewer && <span className="ml-1.5 text-xs font-medium text-foreground/50">(you)</span>}
            </span>
            <LevelBadge level={e.currentLevel} name={e.currentLevelName} badgeColor={e.badgeColor} size="sm" className="hidden sm:inline-flex" />
            <span className="shrink-0 text-lg font-black tabular-nums">
              {e.totalXp.toLocaleString()}
              <span className="ml-1 text-xs font-bold text-foreground/40">XP</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export interface LeaderboardWidgetProps {
  entries: LeaderboardEntryLike[];
  title?: string;

  href?: string;
  renderAddress?: (address: string) => ReactNode;
  className?: string;
}

export function LeaderboardWidget({ entries, title = "Community Rewards", href, renderAddress, className }: LeaderboardWidgetProps) {
  if (entries.length === 0) return null;
  return (
    <section className={cn("rounded-2xl bg-foreground/[0.04] p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black">{title}</h2>
        {href && (
          <a href={href} className="text-xs font-bold text-foreground/50 hover:text-foreground active:opacity-70">
            View scoreboard →
          </a>
        )}
      </div>
      <ol className="space-y-2.5">
        {entries.map((e) => (
          <li key={e.address} className="flex items-center gap-2.5">
            <span className="min-w-0 flex-1 truncate text-sm font-bold">
              {renderAddress ? renderAddress(e.address) : shortenAddress(e.address)}
            </span>
            <LevelBadge level={e.currentLevel} name={e.currentLevelName} badgeColor={e.badgeColor} size="sm" />
          </li>
        ))}
      </ol>
    </section>
  );
}
