"use client";

import useSWR from "swr";
import { normalizeAddress } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { ApiOrdersQuery, ApiOrder, ApiResponse } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";
import { queryKeys } from "./query-keys.js";
import { apiFetch, type ApiFetchConfig } from "./api-fetch.js";

const ACTIVE_ORDER_REFRESH_INTERVAL = 60_000;
const ACTIVE_ORDER_DEDUPING_INTERVAL = 10_000;

export function useOrders(getClient: () => MedialaneClient, query: ApiOrdersQuery = {}) {
  const client = useMedialaneClient(getClient);
  const key = queryKeys.orders(query);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiOrder[]>>(
    key,
    () => client.api.getOrders(query),
    { revalidateOnFocus: false, refreshInterval: 30000, dedupingInterval: 5000 }
  );

  return {
    orders: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
}

export function useOrder(getClient: () => MedialaneClient, orderHash: string | null) {
  const client = useMedialaneClient(getClient);

  const { data, error, isLoading } = useSWR(
    orderHash ? queryKeys.order(orderHash) : null,
    () => client.api.getOrder(orderHash!),
    { revalidateOnFocus: false }
  );

  return { order: data?.data ?? null, isLoading, error };
}

export function useTokenListings(getClient: () => MedialaneClient, contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient(getClient);

  const { data, error, isLoading, mutate } = useSWR(
    contract && tokenId ? queryKeys.listings(contract, tokenId) : null,
    () => client.api.getActiveOrdersForToken(contract!, tokenId!),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return { listings: data?.data ?? [], isLoading, error, mutate };
}

export function useUserOrders(getClient: () => MedialaneClient, address: string | null) {
  const client = useMedialaneClient(getClient);
  const normalized = address ? normalizeAddress("STARKNET", address) : null;

  const { data, error, isLoading, mutate } = useSWR(
    normalized ? queryKeys.userOrders(normalized) : null,
    () => client.api.getOrdersByUser(normalized!),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return { orders: data?.data ?? [], isLoading, error, mutate };
}

/** Fetch counter-offers for a specific original bid (buyer view) or by seller address. */
export function useCounterOffers(
  getClient: () => MedialaneClient,
  {
    originalOrderHash,
    sellerAddress,
  }: {
    originalOrderHash?: string | null;
    sellerAddress?: string | null;
  }
) {
  const client = useMedialaneClient(getClient);
  const normalized = sellerAddress ? normalizeAddress("STARKNET", sellerAddress) : null;
  const key =
    originalOrderHash
      ? queryKeys.counterOffersByOrder(originalOrderHash)
      : normalized
      ? queryKeys.counterOffersBySeller(normalized)
      : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiOrder[]>>(
    key,
    () => client.api.getCounterOffers({
      ...(originalOrderHash ? { originalOrderHash } : {}),
      ...(normalized ? { sellerAddress: normalized } : {}),
    }),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return {
    counterOffers: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

/** Fetch active ERC20 offers received by the given address (offers on tokens they hold). */
export function useReceivedOffers(apiConfig: ApiFetchConfig, address: string | null) {
  const normalized = address ? normalizeAddress("STARKNET", address) : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiOrder[]>>(
    normalized ? ["received-offers", normalized] : null,
    () => apiFetch<ApiResponse<ApiOrder[]>>(apiConfig, `/v1/orders/received/${normalized}?limit=50`),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return { orders: data?.data ?? [], isLoading, error, mutate };
}

export function useCollectionFloorListings(getClient: () => MedialaneClient, contract: string | null, limit = 20) {
  const client = useMedialaneClient(getClient);
  const key = contract ? queryKeys.floorListings(contract, limit) : null;

  const { data, error, isLoading } = useSWR<ApiResponse<ApiOrder[]>>(
    key,
    () =>
      client.api.getOrders({
        collection: contract!,
        status: "ACTIVE",
        sort: "price_asc",
        limit,
      }),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL }
  );

  return {
    listings: data?.data ?? [],
    isLoading,
    error,
  };
}
