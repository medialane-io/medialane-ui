"use client";

import { useEffect, useState } from "react";
import { XpEarned } from "./xp-earned.js";
import type { ApiRewardsConfig } from "@medialane/sdk";

export interface RewardSnapshot {
  totalXp: number;
  currentLevel: number;
}

export interface RewardEarnedProps {
  actionType: string;
  snapshot?: RewardSnapshot;
  className?: string;
}

export function createRewardEarned(getRewardsConfig: () => Promise<ApiRewardsConfig>) {
  let configPromise: Promise<ApiRewardsConfig> | null = null;
  const loadConfig = () => (configPromise ??= getRewardsConfig());

  return function RewardEarned({ actionType, snapshot, className }: RewardEarnedProps) {
    const [config, setConfig] = useState<ApiRewardsConfig | null>(null);

    useEffect(() => {
      let alive = true;
      loadConfig()
        .then((loaded) => {
          if (alive) setConfig(loaded);
        })
        .catch((err) => {
          console.error("rewards config could not be loaded", err);
          configPromise = null;
        });
      return () => {
        alive = false;
      };
    }, []);

    const action = config?.actions.find((a) => a.type === actionType);
    if (!config || !action) return null;

    const level = snapshot ? config.levels.find((l) => l.level === snapshot.currentLevel) : undefined;
    const nextLevel = snapshot ? config.levels.find((l) => l.level === snapshot.currentLevel + 1) : undefined;

    return (
      <div className={className}>
        <XpEarned
          xp={action.xp}
          label={action.label}
          totalXp={snapshot?.totalXp}
          levelXp={snapshot ? level?.xpRequired ?? 0 : undefined}
          nextLevelXp={snapshot ? nextLevel?.xpRequired ?? null : undefined}
        />
      </div>
    );
  };
}
