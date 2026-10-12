"use client";

import useSWR from "swr";
import type { ApiDrop, ApiDropListStatus, ApiDropMint } from "@medialane/sdk";
import { dropClaimedBy, type DropOnchain, type MedialaneClient } from "@medialane/sdk/starknet";
import { useMedialaneClient } from "./use-medialane-client.js";
import { erc20Balance } from "./drop/chain.js";
import type { DropProvider } from "./drop/types.js";

const quiet = { revalidateOnFocus: false, shouldRetryOnError: false } as const;

export function useDrops(getClient: () => MedialaneClient, status: ApiDropListStatus) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR(["drops", status], () => client.api.getDrops({ status, limit: 48 }), quiet);
  return { drops: data?.data ?? ([] as ApiDrop[]), isLoading, error };
}

export function useMyDrops(getClient: () => MedialaneClient, organizer: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR(organizer ? ["my-drops", organizer] : null, () => client.api.getDrops({ organizer: organizer!, limit: 100 }), quiet);
  return { drops: data?.data ?? ([] as ApiDrop[]), isLoading, error };
}

export function useDrop(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR(contract ? ["drop", contract] : null, () => client.api.getDrop(contract!), { ...quiet, refreshInterval: 30_000 });
  return { drop: data ?? null, isLoading, error, mutate };
}

export function useDropMints(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, isLoading, mutate } = useSWR(contract ? ["drop-mints", contract] : null, () => client.api.getDropMints(contract!, { limit: 20 }), { ...quiet, refreshInterval: 30_000 });
  return { mints: data?.data ?? ([] as ApiDropMint[]), isLoading, mutate };
}

/** The platform fee, in basis points, the backend adds to a mint for this app; null until known. */
export function useDropFee(getClient: () => MedialaneClient): number | null {
  const client = useMedialaneClient(getClient);
  const { data } = useSWR("drop-fee", () => client.api.getDropFee(), { revalidateOnFocus: false });
  return data?.launchpadBps ?? null;
}

/** A file from the drop's metadata folder ("1" or "collection.json"). */
export function useDropFile<T = Record<string, unknown>>(getClient: () => MedialaneClient, baseUri: string | null, name: string) {
  const client = useMedialaneClient(getClient);
  const { data } = useSWR(baseUri ? ["drop-file", baseUri, name] : null, async () => (await client.api.resolveMetadata(`${baseUri}${name}`)).data as T, quiet);
  return data ?? null;
}

export interface DropChainState {
  drop: DropOnchain | null;
  claimed: bigint | null;
  balance: bigint | null;
}

export async function readDropState(
  client: MedialaneClient,
  provider: DropProvider,
  contract: string,
  wallet: string | null,
): Promise<DropChainState> {
  const drop = await client.api.getDropState(contract);
  if (!drop) throw new Error("Drop not found");
  const [claimed, balance] = await Promise.all([
    wallet ? dropClaimedBy(provider, contract, wallet) : Promise.resolve(null),
    wallet && drop.price > 0n ? erc20Balance(provider, drop.paymentToken, wallet) : Promise.resolve(null),
  ]);
  return { drop, claimed, balance };
}

export function useDropChain(
  getClient: () => MedialaneClient,
  provider: DropProvider,
  contract: string | null,
  wallet: string | null,
) {
  const client = useMedialaneClient(getClient);
  const { data, mutate, error } = useSWR(
    contract ? ["drop-chain", contract, wallet] : null,
    () => readDropState(client, provider, contract!, wallet),
    { revalidateOnFocus: true, refreshInterval: 15_000 },
  );
  return { ...(data ?? { drop: null, claimed: null, balance: null }), error, mutate };
}
