import { cn } from "../../utils/cn.js";

export interface LevelBadgeProps {
  level: number;
  name: string;
  badgeColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Color-coded level chip — shows the level's title only ("Voyager"), not
 *  the raw number ("Lv.6 Voyager" read as UI noise). The level is still
 *  available on hover via the native title tooltip. Pure presentation — the
 *  consuming app supplies level data from the rewards API. */
export function LevelBadge({ level, name, badgeColor, size = "md", className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "h-5 px-2 text-2xs",
    md: "h-6 px-2.5 text-xs",
    lg: "h-8 px-3.5 text-sm",
  };

  return (
    <span
      title={`Level ${level}`}
      className={cn(
        "inline-flex items-center rounded-full border font-semibold tracking-tight whitespace-nowrap",
        sizeClasses[size],
        className
      )}
      style={{ borderColor: `${badgeColor}60`, backgroundColor: `${badgeColor}18`, color: badgeColor }}
    >
      {name}
    </span>
  );
}
