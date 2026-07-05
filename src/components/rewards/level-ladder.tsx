import { cn } from "../../utils/cn.js";

export interface LevelLadderProps {
  levels: { level: number; name: string; xpRequired: number; badgeColor: string }[];
  currentLevel: number;
  className?: string;
}

/** The full level arc as a horizontally scrollable chip rail; the current
 *  level is highlighted, passed levels render solid, future ones muted. */
export function LevelLadder({ levels, currentLevel, className }: LevelLadderProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {levels.map((l) => {
        const state = l.level < currentLevel ? "done" : l.level === currentLevel ? "current" : "future";
        return (
          <div
            key={l.level}
            title={`${l.xpRequired.toLocaleString()} XP`}
            className={cn(
              "flex shrink-0 select-none flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5",
              state === "future" && "opacity-45"
            )}
            style={{
              borderColor: state === "current" ? l.badgeColor : `${l.badgeColor}40`,
              backgroundColor: state === "current" ? `${l.badgeColor}22` : `${l.badgeColor}0d`,
            }}
          >
            <span className="text-[10px] font-black tabular-nums" style={{ color: l.badgeColor }}>
              {l.level}
            </span>
            <span className="whitespace-nowrap text-[10px] font-semibold" style={{ color: l.badgeColor }}>
              {l.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
