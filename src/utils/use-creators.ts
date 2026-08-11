"use client";

import useSWR from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";

export function useCreators(
  getClient: () => MedialaneClient,
  search?: string,
  page = 1,
  limit = 20
) {
  const { data, error, isLoading } = useSWR(
    `creators-${search ?? ""}-${page}-${limit}`,
    () => getClient().api.getCreators({ search, page, limit }),
    { revalidateOnFocus: false }
  );
  return {
    creators: data?.creators ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}
