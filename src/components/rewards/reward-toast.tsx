"use client";

import { toast } from "sonner";
import { XpToastContent } from "./xp-toast-content.js";
import type { ApiRewardsConfig } from "@medialane/sdk";

export interface RewardToastSnapshot {
  totalXp: number;
  currentLevel: number;
}

/**
 * Optimistic XP feedback after a scoring action. Scores recompute on a
 * schedule, so this shows the action's configured value, never a balance.
 * Fire-and-forget: any failure is silent (rewards UI must never break a flow).
 *
 * Each app supplies its own `getRewardsConfig` (bound to its own
 * `MedialaneClient` singleton) — the caching/toast logic lives here once.
 */
export function createRewardToast(getRewardsConfig: () => Promise<ApiRewardsConfig>) {
  let configPromise: Promise<ApiRewardsConfig> | null = null;
  function loadConfig() {
    configPromise ??= getRewardsConfig();
    return configPromise;
  }

  /**
   * @param snapshot Optional — when provided, the toast additionally shows
   * a progress bar toward the next level. Omit to get today's plain toast.
   */
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
        configPromise = null; // retry on the next action
      });
  };
}
