"use client";

import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client.js";
import type { ApiCollection, ApiResponse, CollectionTokensSort } from "@medialane/sdk";
import { queryKeys } from "./query-keys.js";

export type CollectionSort = "recent" | "supply" | "floor" | "volume" | "name";

export function useCollections(
  page = 1,
  limit = 20,
  isFeatured?: boolean,
  sort: CollectionSort = "recent",
  hideEmpty = true,
  service?: string,

  standard?: string,

  fallback?: ApiCollection[]
) {
  const client = useMedialaneClient();
  const key = `${queryKeys.collections(page, limit, isFeatured, sort, hideEmpty, service)}-${standard ?? ""}`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiCollection[]>>(
    key,
    async () => {
      return client.api.collections.list({ page, limit, isFeatured, sort, service, standard, hideEmpty });
    },
    {
      revalidateOnFocus: false,
      ...(fallback ? { fallbackData: { data: fallback } as ApiResponse<ApiCollection[]> } : {}),
    }
  );

  return {
    collections: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useCollection( contract: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading } = useSWR(
    contract ? queryKeys.collection(contract) : null,
    () => client.api.collections.get(contract!),
    { revalidateOnFocus: false }
  );

  return { collection: data ?? null, isLoading, error };
}

export function useCollectionsByOwner( owner: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading, mutate } = useSWR(
    owner ? queryKeys.collectionsOwner(owner) : null,
    () => client.api.collections.list({ owner: owner!, limit: 50 }),
    { revalidateOnFocus: false, refreshInterval: 60_000 }
  );

  return { collections: data?.data ?? [], isLoading, error, mutate };
}

export function useCollectionTokens(
  contract: string | null,
  page = 1,
  limit = 24,
  sort: CollectionTokensSort = "recent"
) {
  const client = useMedialaneClient();

  const { data, error, isLoading, mutate } = useSWR(
    contract ? queryKeys.collectionTokens(contract, page, limit, sort) : null,
    () => client.api.collections.tokens(contract!, { page: page, limit: limit, sort: sort }),
    { revalidateOnFocus: false }
  );

  return { tokens: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}

function pickNearbyTokens<T extends { tokenId: string }>(
  tokens: T[],
  currentTokenId: string | null,
  count: number
): T[] {
  if (!currentTokenId) return tokens.slice(0, count);
  const idx = tokens.findIndex((t) => String(t.tokenId) === String(currentTokenId));
  if (idx === -1) return tokens.slice(0, count);

  const picked: T[] = [];
  let after = idx + 1;
  let before = idx - 1;
  while (picked.length < count && (after < tokens.length || before >= 0)) {
    if (after < tokens.length) picked.push(tokens[after++]);
    if (picked.length < count && before >= 0) picked.push(tokens[before--]);
  }
  return picked.sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
}

export function useNearbyCollectionTokens(
  contract: string | null,
  currentTokenId: string | null,
  count = 4,
  poolSize = 60
) {
  const { tokens, isLoading, error } = useCollectionTokens(contract, 1, poolSize, "oldest");
  return { tokens: pickNearbyTokens(tokens, currentTokenId, count), isLoading, error };
}
