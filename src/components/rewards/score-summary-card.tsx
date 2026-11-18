"use client";

import { cn } from "../../utils/cn.js";
import { BadgeShelf, type BadgeShelfBadge } from "./badge-shelf.js";
import { useT } from "../../i18n/provider.js";
import { useFormat } from "../../i18n/use-format.js";

export interface ScoreSummaryCardProps {
  level: number;
  levelName: string;
  badgeColor: string;
  totalXp: number;

  levelXp: number;
  nextLevel: { level: number; name: string; xpRequired: number } | null;

  topBadges?: BadgeShelfBadge[];

  href?: string;
  className?: string;
}

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
  const intl = useFormat();
  const t = useT();
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
            <p className="text-xs text-muted-foreground">{t("Level {level}", { level })}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-foreground tabular-nums">{intl.number(totalXp)}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("XP")}</p>
        </div>
      </div>
      {nextLevel && (
        <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
          {t.rich("{value} XP to Level {level} · {name}", { value: intl.number((nextLevel.xpRequired - totalXp)), level: nextLevel.level, name: nextLevel.name })}
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
