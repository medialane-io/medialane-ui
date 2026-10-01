"use client";

import useSWR from "swr";
import type { ApiPlatformStats } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useMedialaneClient } from "./use-medialane-client.js";

export function usePlatformStats(getClient: () => MedialaneClient) {
  const client = useMedialaneClient(getClient);
  const { data, isLoading } = useSWR<ApiPlatformStats>(
    "platform-stats",
    () => client.api.getPlatformStats(),
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );
  return { stats: data ?? null, isLoading };
}
