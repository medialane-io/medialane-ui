"use client";

import useSWR from "swr";
import type { ApiResponse, ApiToken } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";

export function useTokensByIpType( ipTypeSlug: string | null, page = 1, limit = 24) {
  const client = useMedialaneClient();
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiToken[]>>(
    `tokens-by-type-${ipTypeSlug ?? "all"}-${page}-${limit}`,
    () => client.api.getTokens({ page, limit, sort: "recent", ipType: ipTypeSlug ?? undefined }),
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );
  return { tokens: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}
