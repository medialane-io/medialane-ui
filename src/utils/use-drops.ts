"use client";

import useSWR from "swr";
import type { ApiCollection, ApiDropInfo, ApiDropState, ApiMeta, DropMintStatus } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useMedialaneClient } from "./use-medialane-client.js";

export function useDropCollections(getClient: () => MedialaneClient) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<{ data: ApiCollection[]; meta?: ApiMeta }>(
    "drop-collections",
    () => client.api.listCollections({ service: "drop-collection", hideEmpty: false, limit: 50 }),
    { revalidateOnFocus: false }
  );
  return { collections: data?.data ?? [], meta: data?.meta, isLoading, error, mutate };
}

export function useMyDrops(getClient: () => MedialaneClient, owner: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiCollection[]>(
    owner ? `my-drops-${owner}` : null,
    async () => (await client.api.listCollections({ service: "drop-collection", owner: owner!, limit: 50 })).data ?? [],
    { revalidateOnFocus: false }
  );
  return { drops: data ?? [], isLoading, error, mutate };
}

export function useDropMintStatus(getClient: () => MedialaneClient, collection: string | null, wallet: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<DropMintStatus>(
    collection && wallet ? `drop-mint-status-${collection}-${wallet}` : null,
    () => client.api.getDropMintStatus(collection!, wallet!),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { mintStatus: data ?? null, isLoading, error, mutate };
}

export function useDropInfo(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR<ApiDropInfo | null>(
    contract ? `drop-info-${contract}` : null,
    () => client.api.getDropInfo(contract!),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { dropInfo: data ?? null, isLoading, error };
}

export function useOnChainDropState(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiDropState>(
    contract ? `drop-onchain-${contract}` : null,
    () => client.api.getDropState(contract!),
    { revalidateOnFocus: false, refreshInterval: 30_000, shouldRetryOnError: false }
  );
  return { state: data ?? null, isLoading, error, mutate };
}
