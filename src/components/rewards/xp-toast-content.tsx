import { XpProgress } from "./xp-progress.js";

export interface XpToastContentProps {
  xp: number;
  /** The action's configured label, e.g. "Mint an IP asset". */
  label: string;
  color?: string;
  /** Optional progress-bar context — when all three are provided, a thin
   *  XpProgress bar renders under the label, animating toward the next
   *  level. Omit any of them (the default) to render exactly as before. */
  totalXp?: number;
  levelXp?: number;
  nextLevelXp?: number | null;
}

/** Toast body for optimistic XP feedback: "+20 XP · Mint an IP asset".
 *  Scores recompute on a schedule, so this shows the action's configured
 *  value — the caller must never present it as a live balance. */
export function XpToastContent({ xp, label, color = "#8b5cf6", totalXp, levelXp, nextLevelXp }: XpToastContentProps) {
  const showProgress = totalXp !== undefined && levelXp !== undefined && nextLevelXp !== undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 shrink-0 items-center rounded-full border px-2.5 text-sm font-black tabular-nums"
          style={{ borderColor: `${color}60`, backgroundColor: `${color}18`, color }}
        >
          +{xp} XP
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{label}</p>
          {!showProgress && <p className="text-xs text-muted-foreground">Counts toward your score soon</p>}
        </div>
      </div>
      {showProgress && (
        <XpProgress totalXp={totalXp!} levelXp={levelXp!} nextLevelXp={nextLevelXp!} badgeColor={color} variant="bar" />
      )}
    </div>
  );
}
