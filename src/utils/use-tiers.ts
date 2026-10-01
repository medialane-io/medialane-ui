"use client";

import useSWR from "swr";
import type { ApiClient, ApiCollection, ApiTierOnchain } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useMedialaneClient } from "./use-medialane-client.js";

/** An IP Ticket type or IP Club membership tier, with amounts as bigint. */
export interface TierOnchain {
  maxSupply: bigint;
  minted: bigint;
  startTime: number | null;
  endTime: number | null;
  royaltyBps: number;
}

export interface TierListItem extends TierOnchain {
  id: string;
}

function toTier(data: ApiTierOnchain): TierOnchain {
  return {
    maxSupply: BigInt(data.maxSupply),
    minted: BigInt(data.minted),
    startTime: data.startTime,
    endTime: data.endTime,
    royaltyBps: data.royaltyBps,
  };
}

async function readAll(count: number, read: (id: string) => Promise<ApiTierOnchain>): Promise<TierListItem[]> {
  const ids = Array.from({ length: count }, (_, i) => String(i + 1));
  const tiers = await Promise.all(ids.map(read));
  return tiers.map((tier, i) => ({ id: ids[i]!, ...toTier(tier) }));
}

function useMyCollectionsOf(getClient: () => MedialaneClient, service: string, owner: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<ApiCollection[]>(
    owner ? `my-${service}-collections-${owner}` : null,
    async () => (await client.api.listCollections({ owner: owner!, service, limit: 50 })).data ?? [],
    { revalidateOnFocus: false }
  );
  return { collections: data ?? [], isLoading, error, mutate };
}

/** The id the next membership tier will get. Reads a fresh count, so call it right before creating the tier. */
export async function predictNextMembershipId(api: ApiClient, contract: string): Promise<number> {
  return (await api.getClubMembershipCount(contract)) + 1;
}

/** The id the next ticket type will get. Reads a fresh count, so call it right before creating the ticket. */
export async function predictNextTicketId(api: ApiClient, contract: string): Promise<number> {
  return (await api.getTicketCount(contract)) + 1;
}

export function useMyClubCollections(getClient: () => MedialaneClient, owner: string | null) {
  return useMyCollectionsOf(getClient, "ip-club", owner);
}

export function useMyTicketCollections(getClient: () => MedialaneClient, owner: string | null) {
  return useMyCollectionsOf(getClient, "ip-tickets", owner);
}

export function useMembershipList(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<TierListItem[]>(
    contract ? `membership-list-${contract}` : null,
    async () =>
      readAll(await client.api.getClubMembershipCount(contract!), (id) => client.api.getClubMembership(contract!, id)),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  );
  return { memberships: data ?? [], isLoading, error, mutate };
}

export function useTicketList(getClient: () => MedialaneClient, contract: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading, mutate } = useSWR<TierListItem[]>(
    contract ? `ticket-list-${contract}` : null,
    async () => readAll(await client.api.getTicketCount(contract!), (id) => client.api.getTicket(contract!, id)),
    { revalidateOnFocus: false, dedupingInterval: 15_000 }
  );
  return { tickets: data ?? [], isLoading, error, mutate };
}

export function useMembershipOnchain(getClient: () => MedialaneClient, contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR<TierOnchain>(
    contract && tokenId ? `membership-onchain-${contract}-${tokenId}` : null,
    async () => toTier(await client.api.getClubMembership(contract!, tokenId!)),
    { revalidateOnFocus: false, shouldRetryOnError: false, dedupingInterval: 30_000 }
  );
  return { membership: data ?? null, isLoading, error };
}

export function useTicketOnchain(getClient: () => MedialaneClient, contract: string | null, tokenId: string | null) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR<TierOnchain>(
    contract && tokenId ? `ticket-onchain-${contract}-${tokenId}` : null,
    async () => toTier(await client.api.getTicket(contract!, tokenId!)),
    { revalidateOnFocus: false, shouldRetryOnError: false, dedupingInterval: 30_000 }
  );
  return { ticket: data ?? null, isLoading, error };
}

export function useIsMemberOf(
  getClient: () => MedialaneClient,
  contract: string | null,
  tokenId: string | null,
  wallet: string | null
) {
  const client = useMedialaneClient(getClient);
  const { data, error, isLoading } = useSWR<boolean>(
    contract && tokenId && wallet ? `is-member-of-${contract}-${tokenId}-${wallet}` : null,
    () => client.api.isClubMember(contract!, tokenId!, wallet!),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  return { isMember: data ?? false, isLoading, error };
}
