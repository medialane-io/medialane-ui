"use client";

import { useEffect, useState } from "react";
import { XpEarned } from "./xp-earned.js";
import type { ApiRewardsConfig } from "@medialane/sdk";
import { useMedialaneApp } from "../medialane-app.js";

export interface RewardSnapshot {
  totalXp: number;
  currentLevel: number;
}

export interface RewardEarnedProps {
  actionType: string;
  snapshot?: RewardSnapshot;
  className?: string;
}

const configs = new WeakMap<object, Promise<ApiRewardsConfig>>();

export function RewardEarned({ actionType, snapshot, className }: RewardEarnedProps) {
  const api = useMedialaneApp().getClient().api;
  const [config, setConfig] = useState<ApiRewardsConfig | null>(null);

  useEffect(() => {
    let alive = true;
    let pending = configs.get(api);
    if (!pending) {
      pending = api.rewards.config();
      configs.set(api, pending);
    }
    pending
      .then((loaded) => {
        if (alive) setConfig(loaded);
      })
      .catch((err) => {
        console.error("rewards config could not be loaded", err);
        configs.delete(api);
      });
    return () => {
      alive = false;
    };
  }, [api]);

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
}
