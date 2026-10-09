"use client";

import useSWR from "swr";
import type { ApiCollection, ApiMeta } from "@medialane/sdk";
import { popHasClaimed, type MedialaneClient } from "@medialane/sdk/starknet";
import type { ProviderInterface } from "starknet";
import { useMedialaneClient } from "./use-medialane-client.js";

export function usePopCollections(getClient: () => MedialaneClient) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<{ data: ApiCollection[]; meta?: ApiMeta }>(
    "pop-collections",
    () => client.api.listCollections({ service: "pop-protocol", hideEmpty: false, limit: 50 }),
    { revalidateOnFocus: false }
  );
  return { collections: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}

export function useMyPopEvents(getClient: () => MedialaneClient, owner: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiCollection[]>(
    owner ? `my-pop-events-${owner}` : null,
    async () => (await client.api.listCollections({ service: "pop-protocol", owner: owner!, limit: 50 })).data ?? [],
    { revalidateOnFocus: false }
  );
  return { events: data ?? [], isLoading, error, mutate };
}

export function popClaimedKey(collection: string | null, wallet: string | null): string | null {
  return collection && wallet ? `pop-claimed-${collection}-${wallet}` : null;
}

/** Whether `wallet` already holds this collection's credential, read from chain. */
export function usePopClaimStatus(
  provider: Pick<ProviderInterface, "callContract">,
  collection: string | null,
  wallet: string | null,
) {
  const { data, error, isLoading, mutate } = useSWR<boolean>(
    popClaimedKey(collection, wallet),
    () => popHasClaimed(provider, collection!, wallet!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  return { hasClaimed: data ?? null, isLoading, error, mutate };
}
