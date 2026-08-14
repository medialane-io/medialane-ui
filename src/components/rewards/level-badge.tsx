import { cn } from "../../utils/cn.js";

export interface LevelBadgeProps {
  level: number;
  name: string;

  badgeColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

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
