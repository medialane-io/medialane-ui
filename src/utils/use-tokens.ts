"use client";

import { useState } from "react";
import useSWR from "swr";
import type { ApiToken } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";
import { queryKeys } from "./query-keys.js";

const EMPTY_TOKENS: ApiToken[] = [];

const INDEXING_POLL_MS = 10_000;
const INDEXING_WINDOW_MS = 60_000;

function isNotIndexedYet(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && (error as { status?: unknown }).status === 404,
  );
}

export function useToken( contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();
  const [startedAt] = useState(() => Date.now());

  const { data, error, isLoading, mutate } = useSWR(
    contract && tokenId ? queryKeys.token(contract, tokenId) : null,
    () => client.api.getToken(contract!, tokenId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      refreshInterval: (latest) =>
        latest?.data || Date.now() - startedAt > INDEXING_WINDOW_MS ? 0 : INDEXING_POLL_MS,
    }
  );

  const token = data?.data ?? null;
  const withinWindow = Date.now() - startedAt <= INDEXING_WINDOW_MS;

  return {
    token,
    isLoading,
    isIndexing: !token && isNotIndexedYet(error) && withinWindow,
    error: isNotIndexedYet(error) ? undefined : error,
    mutate,
  };
}

export function useTokenBalance(
  contract: string | null,
  tokenId: string | null,
  owner: string | null | undefined,
) {
  const client = useMedialaneClient();

  const { data, mutate } = useSWR(
    contract && tokenId && owner ? queryKeys.tokenBalance(contract, tokenId, owner) : null,
    () => client.api.getTokenBalance(contract!, tokenId!, owner!),
    { revalidateOnFocus: false }
  );

  return { amount: data?.data.amount ?? null, mutate };
}

export function useTokensByOwner(
  address: string | null,
  page = 1,
  limit = 20,
  refreshMs = 60_000,
) {
  const client = useMedialaneClient();

  const { data, error, isLoading, mutate } = useSWR(
    address ? queryKeys.tokensOwned(address, page, limit) : null,
    () => client.api.getTokensByOwner(address!, page, limit),
    { revalidateOnFocus: false, refreshInterval: refreshMs, revalidateOnMount: true }
  );

  return {
    tokens: data?.data ?? EMPTY_TOKENS,
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useTokenHistory( contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading } = useSWR(
    contract && tokenId ? queryKeys.tokenHistory(contract, tokenId) : null,
    () => client.api.getTokenHistory(contract!, tokenId!),
    { revalidateOnFocus: false }
  );

  return { history: data?.data ?? [], isLoading, error };
}

export function useTokenOwners(contract: string | null, tokenId: string | null, page: number) {
  const client = useMedialaneClient();
  const { data, error, isLoading } = useSWR(
    contract && tokenId ? ["token-owners", contract, tokenId, page] : null,
    () => client.api.getTokenOwners(contract!, tokenId!, page),
    { revalidateOnFocus: false },
  );
  return { owners: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, error };
}
