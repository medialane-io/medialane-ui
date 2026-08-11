import { cn } from "../../utils/cn.js";

export interface LevelBadgeProps {
  level: number;
  name: string;
  /** Kept for interface consistency with other rewards components that do
   *  use per-level color (XpProgress, LevelUpCelebration, JourneyPath) —
   *  this component intentionally ignores it in favor of one signature
   *  brand gradient across every level, not 20+ flat per-level colors. */
  badgeColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Level chip — shows the level's title only ("Voyager"), not the raw
 *  number ("Lv.6 Voyager" read as UI noise). The level is still available
 *  on hover via the native title tooltip. One signature orange->maeve
 *  gradient fill, white text — vivid and consistent regardless of level,
 *  rather than a washed-out per-level tint. Pure presentation — the
 *  consuming app supplies level data from the rewards API. */
export function LevelBadge({ level, name, size = "md", className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "h-5 px-2.5 text-2xs",
    md: "h-6 px-3 text-xs",
    lg: "h-8 px-4 text-sm",
  };

  return (
    <span
      title={`Level ${level}`}
      className={cn(
        "inline-flex items-center rounded-full font-bold tracking-tight whitespace-nowrap text-white bg-gradient-to-r from-brand-orange to-brand-maeve",
        sizeClasses[size],
        className
      )}
    >
      {name}
    </span>
  );
}
