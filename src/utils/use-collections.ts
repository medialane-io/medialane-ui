"use client";

import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client.js";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { ApiCollection, ApiResponse, CollectionTokensSort } from "@medialane/sdk";
import { queryKeys } from "./query-keys.js";

export type CollectionSort = "recent" | "supply" | "floor" | "volume" | "name";

export function useCollections(
  getClient: () => MedialaneClient,
  page = 1,
  limit = 20,
  isFeatured?: boolean,
  sort: CollectionSort = "recent",
  hideEmpty = true,
  service?: string,

  standard?: string,

  fallback?: ApiCollection[]
) {
  const client = useMedialaneClient(getClient);
  const key = `${queryKeys.collections(page, limit, isFeatured, sort, hideEmpty, service)}-${standard ?? ""}`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiCollection[]>>(
    key,
    async () => {
      const res = await client.api.getCollections(page, limit, isFeatured, sort, service, undefined, standard);
      return hideEmpty
        ? { ...res, data: res.data.filter((collection) => (collection.totalSupply ?? 0) > 0) }
        : res;
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

export function useCollection(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);

  const { data, error, isLoading } = useSWR(
    contract ? queryKeys.collection(contract) : null,
    () => client.api.getCollection(contract!),
    { revalidateOnFocus: false }
  );

  return { collection: data?.data ?? null, isLoading, error };
}

export function useCollectionsByOwner(getClient: () => MedialaneClient, owner: string | null) {
  const client = useMedialaneClient(getClient);

  const { data, error, isLoading, mutate } = useSWR(
    owner ? queryKeys.collectionsOwner(owner) : null,
    () => client.api.getCollectionsByOwner(owner!),
    { revalidateOnFocus: false, refreshInterval: 60_000 }
  );

  return { collections: data?.data ?? [], isLoading, error, mutate };
}

export function useCollectionTokens(
  getClient: () => MedialaneClient,
  contract: string | null,
  page = 1,
  limit = 24,
  sort: CollectionTokensSort = "recent"
) {
  const client = useMedialaneClient(getClient);

  const { data, error, isLoading, mutate } = useSWR(
    contract ? queryKeys.collectionTokens(contract, page, limit, sort) : null,
    () => client.api.getCollectionTokens(contract!, page, limit, sort),
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
  getClient: () => MedialaneClient,
  contract: string | null,
  currentTokenId: string | null,
  count = 4,
  poolSize = 60
) {
  const { tokens, isLoading, error } = useCollectionTokens(getClient, contract, 1, poolSize, "oldest");
  return { tokens: pickNearbyTokens(tokens, currentTokenId, count), isLoading, error };
}
