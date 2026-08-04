"use client";

import { toast } from "sonner";
import { XpToastContent } from "./xp-toast-content.js";
import type { ApiRewardsConfig } from "@medialane/sdk";

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

  return function rewardToast(actionType: string): void {
    loadConfig()
      .then((config) => {
        const action = config.actions.find((a) => a.type === actionType);
        if (!action) return;
        toast(<XpToastContent xp={action.xp} label={action.label} />, { duration: 3500 });
      })
      .catch(() => {
        configPromise = null; // retry on the next action
      });
  };
}
