import { cn } from "../../utils/cn.js";

export interface XpProgressProps {
  totalXp: number;
  /** XP required to reach the current level. */
  levelXp: number;
  /** XP required for the next level; null at max level (renders full). */
  nextLevelXp: number | null;
  badgeColor: string;
  variant?: "bar" | "ring";
  /** Ring diameter in px (ring variant only). */
  size?: number;
  className?: string;
}

function progressPct({ totalXp, levelXp, nextLevelXp }: Pick<XpProgressProps, "totalXp" | "levelXp" | "nextLevelXp">): number {
  if (nextLevelXp === null || nextLevelXp <= levelXp) return 100;
  return Math.min(100, Math.max(0, Math.round(((totalXp - levelXp) / (nextLevelXp - levelXp)) * 100)));
}

/** XP progress toward the next level, as a rounded bar or an SVG ring. */
export function XpProgress({ totalXp, levelXp, nextLevelXp, badgeColor, variant = "bar", size = 40, className }: XpProgressProps) {
  const pct = progressPct({ totalXp, levelXp, nextLevelXp });

  if (variant === "ring") {
    const stroke = Math.max(2.5, size / 12);
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("shrink-0 -rotate-90", className)}
        role="img"
        aria-label={`${pct}% toward the next level`}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={badgeColor}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
        />
      </svg>
    );
  }

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-border/60", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full transition-[width]" style={{ width: `${pct}%`, backgroundColor: badgeColor }} />
    </div>
  );
}
