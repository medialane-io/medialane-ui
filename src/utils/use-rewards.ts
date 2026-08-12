"use client";

import useSWR from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type {
  ApiUserRewards,
  ApiRewardsLeaderboardEntry,
  ApiRewardsConfig,
  ApiRewardsBatchEntry,
  ApiPointEvent,
} from "@medialane/sdk";

// Legacy local names — kept so existing consumers compile unchanged.
export type UserRewards = ApiUserRewards;
export type LeaderboardEntry = ApiRewardsLeaderboardEntry;
export type BadgeSummary = ApiUserRewards["badges"][number];
export type LevelSummary = NonNullable<ApiUserRewards["nextLevel"]>;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useRewards(getClient: () => MedialaneClient, address: string | null | undefined) {
  return useSWR<ApiUserRewards>(
    address ? `rewards:${address}` : null,
    () => getClient().api.getRewards(address!),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

export function useLeaderboard(getClient: () => MedialaneClient, page = 1, limit = 50) {
  return useSWR<{ data: ApiRewardsLeaderboardEntry[]; meta: { page: number; limit: number; total: number } }>(
    `rewards-leaderboard:${page}:${limit}`,
    async () => {
      const res = await getClient().api.getRewardsLeaderboard(page, limit);
      return {
        data: res.data,
        meta: { page: res.meta?.page ?? page, limit: res.meta?.limit ?? limit, total: res.meta?.total ?? res.data.length },
      };
    },
    { revalidateOnFocus: false, dedupingInterval: 120_000 }
  );
}

export function useRewardsEvents(
  getClient: () => MedialaneClient,
  address: string | null | undefined,
  page = 1,
  limit = 20
) {
  return useSWR<{ data: ApiPointEvent[]; meta: { page: number; limit: number; total: number } }>(
    address ? `rewards-events:${address}:${page}:${limit}` : null,
    async () => {
      const res = await getClient().api.getRewardsEvents(address!, page, limit);
      return {
        data: res.data,
        meta: { page: res.meta?.page ?? page, limit: res.meta?.limit ?? limit, total: res.meta?.total ?? res.data.length },
      };
    },
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

/** Level ladder + action XP values + badge catalog. Changes rarely. */
export function useRewardsConfig(getClient: () => MedialaneClient) {
  return useSWR<ApiRewardsConfig>(
    "rewards-config",
    () => getClient().api.getRewardsConfig(),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  );
}

/** Minimal level info for a page of addresses — ONE request per page.
 *  Returns a Map keyed by normalized address. Failures resolve to undefined
 *  data; list surfaces render nothing rather than an error. */
export function useRewardsBatch(getClient: () => MedialaneClient, addresses: string[]) {
  const unique = [...new Set(addresses)].slice(0, 50);
  const key = unique.length ? `rewards-batch:${[...unique].sort().join(",")}` : null;
  return useSWR<Map<string, ApiRewardsBatchEntry>>(
    key,
    async () => {
      const entries = await getClient().api.getRewardsBatch(unique);
      return new Map(entries.map((e) => [e.address, e]));
    },
    { revalidateOnFocus: false, dedupingInterval: 120_000 }
  );
}
