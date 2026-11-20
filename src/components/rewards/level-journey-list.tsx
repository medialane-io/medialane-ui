"use client";

import { cn } from "../../utils/cn.js";
import { useT } from "../../i18n/provider.js";
import { useFormat } from "../../i18n/use-format.js";

export interface LevelJourneyListLevel {
  level: number;
  name: string;
  xpRequired: number;
  description: string | null;
}

export interface LevelJourneyListProps {
  levels: LevelJourneyListLevel[];
  className?: string;
}

export function LevelJourneyList({ levels, className }: LevelJourneyListProps) {
  const intl = useFormat();
  const t = useT();
  return (
    <ol className={cn("divide-y divide-foreground/[0.06]", className)}>
      {levels.map((l, i) => (
        <li key={l.level} className="flex items-start gap-4 py-4">
          <span className="flex items-center gap-1.5 w-8 shrink-0 pt-0.5">
            <span className="text-xs font-bold text-foreground/30 tabular-nums">{l.level}</span>
            {(i + 1) % 10 === 0 && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-brand-orange"
              />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold">{l.name}</p>
            {l.description && (
              <p className="text-sm text-foreground/60 mt-0.5 leading-relaxed">{l.description}</p>
            )}
          </div>
          <span className="text-sm font-black tabular-nums text-foreground/70 shrink-0">
            {t("{xpRequired} XP", { xpRequired: intl.number(l.xpRequired) })}</span>
        </li>
      ))}
    </ol>
  );
}
