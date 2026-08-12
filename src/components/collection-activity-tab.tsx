"use client";

import { useState, useEffect } from "react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { ApiActivity } from "@medialane/sdk";
import { Inbox } from "lucide-react";
import { useActivities } from "../utils/use-activities.js";
import { ActivityCard, ActivityCardSkeleton } from "./activity-card.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";

const PAGE_SIZE = 24;

export interface CollectionActivityTabProps {
  getClient: () => MedialaneClient;
  contract: string;
}

export function CollectionActivityTab({ getClient, contract }: CollectionActivityTabProps) {
  const [page, setPage] = useState(1);
  const [all, setAll] = useState<ApiActivity[]>([]);
  const { activities, meta, isLoading } = useActivities(getClient, { contract, page, limit: PAGE_SIZE });

  useEffect(() => {
    if (activities.length === 0) return;
    setAll((prev) => (page === 1 ? activities : [...prev, ...activities]));
  }, [activities, page]);

  const hasMore = meta ? all.length < (meta.total ?? 0) : false;

  if (isLoading && all.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ActivityCardSkeleton key={i} />)}
      </div>
    );
  }

  if (all.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 max-w-xs">
          Mints, listings, offers, and sales in this collection will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {all.map((a, i) => (
          <ActivityCard key={`${a.txHash ?? a.orderHash}-${i}`} activity={a} />
        ))}
      </div>
      <LoadMoreSentinel hasMore={hasMore} isLoading={isLoading} onLoadMore={() => setPage((p) => p + 1)} />
    </div>
  );
}
