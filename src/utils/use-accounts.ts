"use client";

import useSWRInfinite from "swr/infinite";
import type { ApiAccount } from "@medialane/sdk";
import { useMedialaneClient } from "./use-medialane-client.js";
import { QUERY_PREFIX } from "./query-keys.js";

const EMPTY_ACCOUNTS: ApiAccount[] = [];

export function useAccounts(search = "", limit = 24) {
  const client = useMedialaneClient();

  const { data, error, isLoading, isValidating, setSize } = useSWRInfinite(
    (index) => [QUERY_PREFIX.accountsPages, search, limit, index + 1] as const,
    ([, query, pageSize, page]) => client.api.accounts.list({ search: query || undefined, page, limit: pageSize }),
    { revalidateOnFocus: false, revalidateFirstPage: false },
  );

  const accounts = data ? data.flatMap((page) => page.data) : EMPTY_ACCOUNTS;
  const total = data?.[0]?.meta?.total ?? 0;

  return {
    accounts,
    total,
    isLoading,
    isLoadingMore: isValidating,
    hasMore: accounts.length < total,
    loadMore: () => void setSize((size) => size + 1),
    error,
  };
}
