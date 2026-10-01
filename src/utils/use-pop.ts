"use client";

import useSWR from "swr";
import type { ApiCollection, ApiMeta, PopClaimStatus } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
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

export function usePopClaimStatus(getClient: () => MedialaneClient, collection: string | null, wallet: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<PopClaimStatus>(
    collection && wallet ? `pop-eligibility-${collection}-${wallet}` : null,
    () => client.api.getPopEligibility(collection!, wallet!),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { claimStatus: data ?? null, isLoading, error, mutate };
}
