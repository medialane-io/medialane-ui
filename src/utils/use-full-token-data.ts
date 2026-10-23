"use client";

import useSWR from "swr";
import type { ApiIpNftTokenData } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";

export function useFullTokenData(contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();
  const { data, error, isLoading } = useSWR<ApiIpNftTokenData | null>(
    contract && tokenId ? ["full-token-data", contract, tokenId] : null,
    () => client.api.chainReads.ipNftTokenData(contract!, tokenId!),
    { revalidateOnFocus: false, refreshInterval: 0 },
  );
  return { data: data ?? null, isLoading, error };
}
