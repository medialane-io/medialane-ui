"use client";

import { useState, useEffect, useRef } from "react";
import { useActivities } from "../utils/use-activities.js";
import type { ApiActivitiesQuery, ApiActivity } from "@medialane/sdk";
import { Skeleton } from "./skeleton.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { Zap } from "lucide-react";
import { ACTIVITY_TYPE_CONFIG, TYPE_FILTERS } from "../data/activity.js";
import { ActivityRow } from "./activity-row.js";
import { cn } from "../utils/cn.js";
import { emptyMessages } from "../utils/empty-messages.js";

const PAGE_SIZE = 30;

export function ActivitiesFeed() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [allActivities, setAllActivities] = useState<ApiActivity[]>([]);

  const prevType = useRef(typeFilter);
  useEffect(() => {
    if (prevType.current !== typeFilter) {
      prevType.current = typeFilter;
      setPage(1);
      setAllActivities([]);
    }
  }, [typeFilter]);

  const { activities, meta, isLoading } = useActivities({
    limit: PAGE_SIZE,
    page,
    type: (typeFilter as ApiActivitiesQuery["type"]) || undefined,
  });

  useEffect(() => {
    if (isLoading) return;
    if (page === 1) {
      setAllActivities(activities);
    } else {
      setAllActivities((prev) => {
        const existing = new Set(
          prev.map((a) => `${a.txHash}-${a.type}-${a.nftTokenId ?? ""}`)
        );
        const newItems = activities.filter(
          (a) => !existing.has(`${a.txHash}-${a.type}-${a.nftTokenId ?? ""}`)
        );
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
  }, [activities, isLoading, page]);

  const isInitialLoading = isLoading && allActivities.length === 0;
  const isLoadingMore = isLoading && allActivities.length > 0;
  const hasMore = meta?.total != null ? allActivities.length < meta.total : false;
  const total = meta?.total ?? null;

  return (
    <div className="space-y-5">
      {total != null && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground tabular-nums">
              {total.toLocaleString()}
            </span>
            {typeFilter ? `${typeFilter} events` : "total events"}
          </span>
          {typeFilter && allActivities.length > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{allActivities.length.toLocaleString()} loaded</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => {
          const typeConfig = f.value ? ACTIVITY_TYPE_CONFIG[f.value] : null;
          const Icon = typeConfig?.icon;
          const isActive = typeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-3 w-3",
                    isActive ? typeConfig?.colorClass : ""
                  )}
                />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      {isInitialLoading ? (
        <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-card">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <Skeleton className="h-9 w-9 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-2.5 w-8" />
                </div>
                <Skeleton className="h-2.5 w-12 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      ) : allActivities.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Zap className="h-5 w-5 text-muted-foreground" />
          </div>
          {typeFilter ? (
            <p className="text-muted-foreground">{`No ${typeFilter} events yet.`}</p>
          ) : (
            <div>
              <p className="font-medium">{emptyMessages.activity.title}</p>
              <p className="text-sm text-muted-foreground">{emptyMessages.activity.description}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
            {allActivities.map((activity, i) => (
              <ActivityRow
                key={`${activity.txHash}-${activity.type}-${activity.nftTokenId ?? i}`}
                activity={activity}
                showActor
                showExplorer
              />
            ))}
          </div>

          <LoadMoreSentinel
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={() => setPage((p) => p + 1)}
          />
        </div>
      )}
    </div>
  );
}
