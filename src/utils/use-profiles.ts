"use client";

import useSWR from "swr";
import { useMedialaneApp } from "../components/medialane-app.js";

export function useCollectionProfile( contractAddress: string | undefined) {
  const { getClient } = useMedialaneApp();
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `profile-collection-${contractAddress}` : null,
    () => getClient().api.collections.findProfile(contractAddress!),
    { revalidateOnFocus: false }
  );
  return { profile: data ?? null, isLoading, error, mutate };
}

export function useCreatorProfile( walletAddress: string | undefined) {
  const { getClient } = useMedialaneApp();
  const { data, error, isLoading, mutate } = useSWR(
    walletAddress ? `profile-creator-${walletAddress}` : null,
    async () => {
      try {
        return await getClient().api.creators.findProfile(walletAddress!);
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

export function useCreatorByUsername(username: string | null | undefined) {
  const { getClient } = useMedialaneApp();
  const { data, error, isLoading } = useSWR(
    username ? `creator-by-username-${username}` : null,
    () => getClient().api.creators.findByUsername(username!),
    { revalidateOnFocus: false, revalidateOnMount: true }
  );
  return { creator: data ?? null, isLoading, error };
}
