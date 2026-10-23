"use client";

import useSWR from "swr";
import { normalizeAddress } from "@medialane/sdk";
import type { ApiOrdersQuery, ApiOrder, ApiResponse } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";
import { queryKeys } from "./query-keys.js";

const ACTIVE_ORDER_REFRESH_INTERVAL = 60_000;
const ACTIVE_ORDER_DEDUPING_INTERVAL = 10_000;

export function useOrders( query: ApiOrdersQuery = {}) {
  const client = useMedialaneClient();
  const key = queryKeys.orders(query);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiOrder[]>>(
    key,
    () => client.api.orders.list(query),
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

export function useOrder( orderHash: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading } = useSWR(
    orderHash ? queryKeys.order(orderHash) : null,
    () => client.api.orders.get(orderHash!),
    { revalidateOnFocus: false }
  );

  return { order: data ?? null, isLoading, error };
}

export function useTokenListings( contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient();

  const { data, error, isLoading, mutate } = useSWR(
    contract && tokenId ? queryKeys.listings(contract, tokenId) : null,
    () => client.api.orders.forToken(contract!, tokenId!),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return { listings: data?.data ?? [], isLoading, error, mutate };
}

export function useUserOrders( address: string | null) {
  const client = useMedialaneClient();
  const normalized = address ? normalizeAddress("STARKNET", address) : null;

  const { data, error, isLoading, mutate } = useSWR(
    normalized ? queryKeys.userOrders(normalized) : null,
    () => client.api.orders.byUser(normalized!),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return { orders: data?.data ?? [], isLoading, error, mutate };
}

export function useCounterOffers(
  {
    originalOrderHash,
    sellerAddress,
  }: {
    originalOrderHash?: string | null;
    sellerAddress?: string | null;
  }
) {
  const client = useMedialaneClient();
  const normalized = sellerAddress ? normalizeAddress("STARKNET", sellerAddress) : null;
  const key =
    originalOrderHash
      ? queryKeys.counterOffersByOrder(originalOrderHash)
      : normalized
      ? queryKeys.counterOffersBySeller(normalized)
      : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiOrder[]>>(
    key,
    () => client.api.orders.counterOffers({
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

export function useReceivedOffers( address: string | null) {
  const client = useMedialaneClient();
  const normalized = address ? normalizeAddress("STARKNET", address) : null;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ApiOrder[]>>(
    normalized ? ["received-offers", normalized] : null,
    () => client.api.orders.receivedBy(normalized!, { limit: 50 }),
    { revalidateOnFocus: false, refreshInterval: ACTIVE_ORDER_REFRESH_INTERVAL, dedupingInterval: ACTIVE_ORDER_DEDUPING_INTERVAL }
  );

  return { orders: data?.data ?? [], isLoading, error, mutate };
}

export function useCollectionFloorListings( contract: string | null, limit = 20) {
  const client = useMedialaneClient();
  const key = contract ? queryKeys.floorListings(contract, limit) : null;

  const { data, error, isLoading } = useSWR<ApiResponse<ApiOrder[]>>(
    key,
    () =>
      client.api.orders.list({
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
