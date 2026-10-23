"use client";

import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client.js";
import type { ApiPublicRemix, ApiResponse } from "@medialane/sdk";

export function useTokenRemixes( contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiPublicRemix[]>>(
    contract && tokenId ? `token-remixes-${contract}-${tokenId}` : null,
    () => client.api.tokens.remixes(contract!, tokenId!),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  return { remixes: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, error, mutate };
}
