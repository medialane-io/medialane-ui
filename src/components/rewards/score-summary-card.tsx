import { cn } from "../../utils/cn.js";
import { BadgeShelf, type BadgeShelfBadge } from "./badge-shelf.js";

export interface ScoreSummaryCardProps {
  level: number;
  levelName: string;
  badgeColor: string;
  totalXp: number;
  /** XP required to reach the current level. */
  levelXp: number;
  nextLevel: { level: number; name: string; xpRequired: number } | null;
  /** A few earned badges to preview (already limited by the caller). */
  topBadges?: BadgeShelfBadge[];
  /** Where the card links ("/rewards"); rendered as a plain anchor. */
  href?: string;
  className?: string;
}

/** Compact score overview for portfolio/profile surfaces: level ring, XP,
 *  next-level progress, and a short badge preview. */
export function ScoreSummaryCard({
  level,
  levelName,
  badgeColor,
  totalXp,
  nextLevel,
  topBadges,
  href,
  className,
}: ScoreSummaryCardProps) {
  const body = (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-12 w-12 rounded-xl shrink-0 flex items-center justify-center text-xl font-black text-white"
            style={{ backgroundColor: badgeColor }}
          >
            {level}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-foreground truncate">{levelName}</p>
            <p className="text-xs text-muted-foreground">Level {level}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-foreground tabular-nums">{totalXp.toLocaleString()}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">XP</p>
        </div>
      </div>
      {nextLevel && (
        <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
          {(nextLevel.xpRequired - totalXp).toLocaleString()} XP to Level {nextLevel.level} · {nextLevel.name}
        </p>
      )}
      {topBadges && topBadges.length > 0 && (
        <BadgeShelf badges={topBadges} className={!nextLevel ? "border-t border-border/50 pt-3" : undefined} />
      )}
    </div>
  );

  if (!href) return body;
  return (
    <a href={href} className="block active:opacity-80">
      {body}
    </a>
  );
}
