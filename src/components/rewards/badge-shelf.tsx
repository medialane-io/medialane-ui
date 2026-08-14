"use client";

import React from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "../../utils/cn.js";

export interface BadgeShelfBadge {
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

export interface BadgeShelfProps {

  badges: BadgeShelfBadge[];

  earnedKeys?: string[];

  showLocked?: boolean;
  className?: string;
}

const iconCache = new Map<string, React.ComponentType<LucideProps>>();

export function BadgeIcon({ name, color, className }: { name: string; color: string; className?: string }) {
  const [Icon, setIcon] = React.useState<React.ComponentType<LucideProps> | null>(
    () => iconCache.get(name) ?? null
  );

  React.useEffect(() => {
    if (iconCache.has(name)) {
      setIcon(() => iconCache.get(name)!);
      return;
    }
    import("lucide-react").then((mod) => {
      const C = (mod as Record<string, unknown>)[name] as React.ComponentType<LucideProps> | undefined;
      if (C) {
        iconCache.set(name, C);
        setIcon(() => C);
      }
    });
  }, [name]);

  if (!Icon) return <span className={cn("rounded-full", className)} style={{ backgroundColor: color }} />;
  return <Icon className={className} style={{ color }} />;
}

export function BadgeShelf({ badges, earnedKeys, showLocked = false, className }: BadgeShelfProps) {
  const earned = earnedKeys ? new Set(earnedKeys) : null;
  const visible = badges.filter((b) => showLocked || !earned || earned.has(b.key));
  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((badge) => {
        const isLocked = earned ? !earned.has(badge.key) : false;
        return (
          <div
            key={badge.key}
            title={isLocked ? `${badge.description} — keep going to earn this` : badge.description}
            className={cn(
              "flex h-7 select-none items-center gap-1.5 rounded-full border px-2.5",
              isLocked && "opacity-45 grayscale"
            )}
            style={{
              borderColor: `${badge.color}60`,
              backgroundColor: `${badge.color}14`,
            }}
          >
            <BadgeIcon name={badge.icon} color={badge.color} className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-semibold" style={{ color: badge.color }}>
              {badge.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
