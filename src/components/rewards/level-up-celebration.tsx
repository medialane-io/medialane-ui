"use client";

import { useEffect } from "react";
import { LevelBadge } from "./level-badge.js";
import { cn } from "../../utils/cn.js";

export interface LevelUpCelebrationProps {
  level: number;
  name: string;
  badgeColor: string;
  onDismiss: () => void;
  className?: string;
}

const PARTICLE_COUNT = 14;

/** Auto-dismissing celebration burst for a level-up moment. Pure CSS
 *  animation, no dependency — particles are positioned/rotated via inline
 *  style so the same component works without a keyframe-per-particle
 *  stylesheet entry. */
export function LevelUpCelebration({ level, name, badgeColor, onDismiss, className }: LevelUpCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-background/40 backdrop-blur-sm",
        className
      )}
      onClick={onDismiss}
    >
      <div className="relative flex flex-col items-center gap-3 animate-in zoom-in-95 fade-in duration-300">
        <div className="pointer-events-none absolute inset-0 -z-10">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const angle = (360 / PARTICLE_COUNT) * i;
            const distance = 60 + (i % 3) * 20;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full animate-in fade-in zoom-in duration-700"
                style={{
                  backgroundColor: badgeColor,
                  transform: `rotate(${angle}deg) translate(${distance}px) rotate(-${angle}deg)`,
                }}
              />
            );
          })}
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Level up</p>
        <LevelBadge level={level} name={name} badgeColor={badgeColor} size="lg" />
      </div>
    </div>
  );
}
