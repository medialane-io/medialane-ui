import type { ReactNode } from "react";
import { cn } from "../../utils/cn.js";
import { shortenAddress } from "../../utils/address.js";
import { LevelBadge } from "./level-badge.js";

export interface LeaderboardEntryLike {
  /** Kept for API compatibility with the backend's ordered response — not
   *  rendered. This is a scoreboard, not a ranking: no "#1/#2/#3", no podium
   *  colors. Order in the array is still the sort order the caller gets. */
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
  /** The viewer's address — its row gets highlighted. */
  highlightAddress?: string | null;
  /** Render the address cell (e.g. a profile link). Defaults to a shortened address. */
  renderAddress?: (address: string) => ReactNode;
  className?: string;
}

/** Scoreboard rows: address, level chip, points. No position number or
 *  podium coloring — this celebrates participation, not competition. */
export function LeaderboardTable({ entries, highlightAddress, renderAddress, className }: LeaderboardTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border", className)}>
      {entries.map((e) => {
        const isViewer = highlightAddress != null && e.address === highlightAddress;
        return (
          <div
            key={e.address}
            className={cn(
              "flex items-center gap-3 border-b border-border/60 bg-card px-3 py-2.5 last:border-b-0 sm:px-4",
              isViewer && "bg-primary/10"
            )}
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {renderAddress ? renderAddress(e.address) : shortenAddress(e.address)}
              {isViewer && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
            </span>
            <LevelBadge level={e.currentLevel} name={e.currentLevelName} badgeColor={e.badgeColor} size="sm" className="hidden sm:inline-flex" />
            <span className="shrink-0 text-sm font-semibold tabular-nums">{e.totalXp.toLocaleString()} pts</span>
          </div>
        );
      })}
    </div>
  );
}

export interface LeaderboardWidgetProps {
  entries: LeaderboardEntryLike[];
  title?: string;
  /** Link to the full scoreboard ("/rewards"). */
  href?: string;
  renderAddress?: (address: string) => ReactNode;
  className?: string;
}

/** Compact card for homepage/discover rails — same no-ranking scoreboard rows. */
export function LeaderboardWidget({ entries, title = "Community Rewards", href, renderAddress, className }: LeaderboardWidgetProps) {
  if (entries.length === 0) return null;
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-black">{title}</h2>
        {href && (
          <a href={href} className="text-xs font-semibold text-muted-foreground active:opacity-70">
            View scoreboard →
          </a>
        )}
      </div>
      <ol className="space-y-2.5">
        {entries.map((e) => (
          <li key={e.address} className="flex items-center gap-2.5">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {renderAddress ? renderAddress(e.address) : shortenAddress(e.address)}
            </span>
            <LevelBadge level={e.currentLevel} name={e.currentLevelName} badgeColor={e.badgeColor} size="sm" />
          </li>
        ))}
      </ol>
    </section>
  );
}
