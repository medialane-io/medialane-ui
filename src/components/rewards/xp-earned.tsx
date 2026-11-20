"use client";

import { XpProgress } from "./xp-progress.js";
import { useT } from "../../i18n/provider.js";

export interface XpEarnedProps {
  xp: number;

  label: string;
  color?: string;

  totalXp?: number;
  levelXp?: number;
  nextLevelXp?: number | null;
}

export function XpEarned({ xp, label, color = "#8b5cf6", totalXp, levelXp, nextLevelXp }: XpEarnedProps) {
  const t = useT();
  const showProgress = totalXp !== undefined && levelXp !== undefined && nextLevelXp !== undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 shrink-0 items-center rounded-full px-2.5 text-sm font-black tabular-nums"
          style={{ backgroundColor: `${color}18`, color }}
        >{t("+{xp} XP", { xp })}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          {!showProgress && <p className="text-xs text-muted-foreground">{t("Counts toward your score soon")}</p>}
        </div>
      </div>
      {showProgress && (
        <XpProgress totalXp={totalXp!} levelXp={levelXp!} nextLevelXp={nextLevelXp!} badgeColor={color} variant="bar" />
      )}
    </div>
  );
}
