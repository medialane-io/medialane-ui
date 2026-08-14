"use client";

import { toast } from "sonner";
import { XpToastContent } from "./xp-toast-content.js";
import type { ApiRewardsConfig } from "@medialane/sdk";

export interface RewardToastSnapshot {
  totalXp: number;
  currentLevel: number;
}

export function createRewardToast(getRewardsConfig: () => Promise<ApiRewardsConfig>) {
  let configPromise: Promise<ApiRewardsConfig> | null = null;
  function loadConfig() {
    configPromise ??= getRewardsConfig();
    return configPromise;
  }

  return function rewardToast(actionType: string, snapshot?: RewardToastSnapshot): void {
    loadConfig()
      .then((config) => {
        const action = config.actions.find((a) => a.type === actionType);
        if (!action) return;

        if (!snapshot) {
          toast(<XpToastContent xp={action.xp} label={action.label} />, { duration: 3500 });
          return;
        }

        const level = config.levels.find((l) => l.level === snapshot.currentLevel);
        const nextLevel = config.levels.find((l) => l.level === snapshot.currentLevel + 1);
        toast(
          <XpToastContent
            xp={action.xp}
            label={action.label}
            totalXp={snapshot.totalXp}
            levelXp={level?.xpRequired ?? 0}
            nextLevelXp={nextLevel?.xpRequired ?? null}
          />,
          { duration: 3500 }
        );
      })
      .catch(() => {
        configPromise = null;
      });
  };
}
