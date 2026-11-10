"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type { ApiToken } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";
import { QUERY_PREFIX, queryKeys } from "./query-keys.js";

const EMPTY_TOKENS: ApiToken[] = [];

const INDEXING_POLL_MS = 10_000;
const INDEXING_WINDOW_MS = 60_000;

function isNotIndexedYet(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && (error as { status?: unknown }).status === 404,
  );
}

export function useToken( contract: string | null, tokenId: string | null, initial?: ApiToken | null) {
  const client = useMedialaneClient();
  const [startedAt] = useState(() => Date.now());

  const { data, error, isLoading, mutate } = useSWR(
    contract && tokenId ? queryKeys.token(contract, tokenId) : null,
    () => client.api.tokens.get(contract!, tokenId!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      fallbackData: initial ?? undefined,
      refreshInterval: (latest) =>
        latest || initial || Date.now() - startedAt > INDEXING_WINDOW_MS ? 0 : INDEXING_POLL_MS,
    }
  );

  const token = data ?? null;
  const withinWindow = Date.now() - startedAt <= INDEXING_WINDOW_MS;

  return {
    token,
    isLoading: isLoading && !token,
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
    () => client.api.tokens.balance(contract!, tokenId!, owner!),
    { revalidateOnFocus: false }
  );

  return { amount: data?.amount ?? null, mutate };
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
    () => client.api.tokens.ownedBy(address!, { page: page, limit: limit }),
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

export function useOwnedTokens(address: string | null, limit = 20) {
  const client = useMedialaneClient();

  const { data, error, isLoading, isValidating, setSize, mutate } = useSWRInfinite(
    (index) => (address ? ([QUERY_PREFIX.tokensOwnedPages, address, limit, index + 1] as const) : null),
    ([, owner, pageSize, page]) => client.api.tokens.ownedBy(owner, { page, limit: pageSize }),
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const tokens = data ? data.flatMap((page) => page.data) : EMPTY_TOKENS;
  const total = data?.[0]?.meta?.total ?? null;

  return {
    tokens,
    total,
    isLoading,
    isLoadingMore: isValidating,
    hasMore: total !== null && tokens.length < total,
    loadMore: () => void setSize((size) => size + 1),
    error,
    mutate,
  };
}

export function useTokenHistory( contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading } = useSWR(
    contract && tokenId ? queryKeys.tokenHistory(contract, tokenId) : null,
    () => client.api.tokens.history(contract!, tokenId!),
    { revalidateOnFocus: false }
  );

  return { history: data?.data ?? [], isLoading, error };
}

