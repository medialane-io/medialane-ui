"use client";

import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client.js";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { ApiActivitiesQuery, ApiActivity, ApiResponse } from "@medialane/sdk";

export function useActivities(getClient: () => MedialaneClient, query: ApiActivitiesQuery = {}) {
  const client = useMedialaneClient(getClient);
  const key = JSON.stringify({ op: "activities", ...query });

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiActivity[]>>(
    key,
    () => client.api.getActivities(query),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  return {
    activities: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useActivitiesByAddress(getClient: () => MedialaneClient, address: string | null) {
  const client = useMedialaneClient(getClient);

  const { data, error, isLoading, mutate } = useSWR(
    address ? `activities-${address}` : null,
    () => client.api.getActivitiesByAddress(address!),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  return { activities: data?.data ?? [], isLoading, error, mutate };
}
