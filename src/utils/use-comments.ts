"use client";

import useSWR from "swr";
import type { ApiComment } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";

export interface UseCommentsResult {
  comments: ApiComment[];
  total: number;
  isLoading: boolean;
  error: unknown;
  mutate: () => void;
}

export function useComments(contract: string, tokenId: string, page = 1, limit = 20): UseCommentsResult {
  const client = useMedialaneClient();
  const { data, error, isLoading, mutate } = useSWR(
    contract && tokenId ? ["comments", contract, tokenId, page, limit] : null,
    () => client.api.tokens.comments(contract, tokenId, { page, limit }),
    { refreshInterval: 60_000, revalidateOnFocus: false, dedupingInterval: 10_000 },
  );
  return { comments: data?.data ?? [], total: data?.meta?.total ?? 0, isLoading, error, mutate };
}
