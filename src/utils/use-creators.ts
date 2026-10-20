"use client";

import useSWR from "swr";
import { useMedialaneApp } from "../components/medialane-app.js";

export function useCreators(
  search?: string,
  page = 1,
  limit = 20
) {
  const { getClient } = useMedialaneApp();
  const { data, error, isLoading } = useSWR(
    `creators-${search ?? ""}-${page}-${limit}`,
    () => getClient().api.getCreators({ search, page, limit }),
    { revalidateOnFocus: false }
  );
  return {
    creators: data?.creators ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  };
}
