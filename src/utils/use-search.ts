"use client";

import useSWR from "swr";
import { useMedialaneClient } from "./use-medialane-client.js";

export const SEARCH_MIN_LENGTH = 2;

export interface UseSearchOptions {
  limit?: number;

  keepPrevious?: boolean;
}

export function useSearch(query: string, { limit = 10, keepPrevious = false }: UseSearchOptions = {}) {
  const client = useMedialaneClient();
  const q = query.trim();
  const key = q.length >= SEARCH_MIN_LENGTH ? JSON.stringify({ op: "search", q, limit }) : null;

  const { data, error, isLoading } = useSWR(
    key,
    () => client.api.search(q, limit),
    { revalidateOnFocus: false, shouldRetryOnError: false, keepPreviousData: keepPrevious }
  );

  return {
    results: key && data ? data.data : null,
    isLoading,
    error,
  };
}
