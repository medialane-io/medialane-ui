import { cn } from "../../utils/cn.js";
import { LevelBadge } from "./level-badge.js";
import { XpProgress } from "./xp-progress.js";
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
  levelXp,
  nextLevel,
  topBadges,
  href,
  className,
}: ScoreSummaryCardProps) {
  const body = (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <XpProgress
            variant="ring"
            size={52}
            totalXp={totalXp}
            levelXp={levelXp}
            nextLevelXp={nextLevel?.xpRequired ?? null}
            badgeColor={badgeColor}
          />
          <span className="absolute text-sm font-black" style={{ color: badgeColor }}>
            {level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <LevelBadge level={level} name={levelName} badgeColor={badgeColor} size="md" />
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalXp.toLocaleString()} XP</span>
            {nextLevel && (
              <>
                {" · "}
                {(nextLevel.xpRequired - totalXp).toLocaleString()} XP to Lv.{nextLevel.level} {nextLevel.name}
              </>
            )}
          </p>
        </div>
      </div>
      {topBadges && topBadges.length > 0 && <BadgeShelf badges={topBadges} className="mt-3" />}
    </div>
  );

  if (!href) return body;
  return (
    <a href={href} className="block active:opacity-80">
      {body}
    </a>
  );
}
