"use client";

import useSWR from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";

export function useCollectionProfile(getClient: () => MedialaneClient, contractAddress: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `profile-collection-${contractAddress}` : null,
    () => getClient().api.getCollectionProfile(contractAddress!),
    { revalidateOnFocus: false }
  );
  return { profile: data ?? null, isLoading, error, mutate };
}

export function useCreatorProfile(getClient: () => MedialaneClient, walletAddress: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    walletAddress ? `profile-creator-${walletAddress}` : null,
    async () => {
      try {
        return await getClient().api.getCreatorProfile(walletAddress!);
      } catch (e: unknown) {

        const msg = e instanceof Error ? e.message : "";
        const status = (e as { status?: number })?.status;
        if (msg.includes("404") || msg.includes("Not Found") || status === 404) {
          return null;
        }
        throw e;
      }
    },
    { revalidateOnFocus: false, revalidateOnMount: true }
  );
  return { profile: data ?? null, isLoading, error, mutate };
}
