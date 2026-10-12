"use client";

import useSWR from "swr";
import type { ApiToken } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { queryKeys } from "../query-keys.js";
import { useMedialaneClient } from "../use-medialane-client.js";

const EMPTY_TOKENS: ApiToken[] = [];

export function useTokensByOwner(getClient: () => MedialaneClient, address: string | null, page = 1, limit = 20) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR(
    address ? queryKeys.tokensOwned(address, page, limit) : null,
    () => client.api.getTokensByOwner(address!, page, limit),
    { revalidateOnFocus: false, refreshInterval: 60_000, revalidateOnMount: true }
  );
  return { tokens: data?.data ?? EMPTY_TOKENS, isLoading, error };
}
