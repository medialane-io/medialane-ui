"use client";

import useSWR from "swr";
import type {
  ApiUserRewards,
  ApiRewardsLeaderboardEntry,
  ApiRewardsConfig,
  ApiRewardsBatchEntry,
  ApiPointEvent,
} from "@medialane/sdk";
import { useMedialaneApp } from "../components/medialane-app.js";

export type UserRewards = ApiUserRewards;
export type LeaderboardEntry = ApiRewardsLeaderboardEntry;
export type BadgeSummary = ApiUserRewards["badges"][number];
export type LevelSummary = NonNullable<ApiUserRewards["nextLevel"]>;

export function useRewards( address: string | null | undefined) {
  const { getClient } = useMedialaneApp();
  return useSWR<ApiUserRewards>(
    address ? `rewards:${address}` : null,
    () => getClient().api.getRewards(address!),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
}

export function useLeaderboard( page = 1, limit = 50) {
  const { getClient } = useMedialaneApp();
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
  address: string | null | undefined,
  page = 1,
  limit = 20
) {
  const { getClient } = useMedialaneApp();
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

export function useRewardsConfig() {
  const { getClient } = useMedialaneApp();
  return useSWR<ApiRewardsConfig>(
    "rewards-config",
    () => getClient().api.getRewardsConfig(),
    { revalidateOnFocus: false, dedupingInterval: 300_000 }
  );
}

export function useRewardsBatch( addresses: string[]) {
  const { getClient } = useMedialaneApp();
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
