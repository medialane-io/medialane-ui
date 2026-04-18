"use client";

import { Tag } from "lucide-react";
import { FadeIn } from "./motion-primitives.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ActivityFeedShell } from "./activity-feed-shell.js";
import { ActivityRow } from "./activity-row.js";
import type { ApiOrder, ApiActivity } from "@medialane/sdk";

export interface DiscoverFeedSectionProps {
  orders: ApiOrder[];
  isLoading: boolean;
  activities: ApiActivity[];
  activitiesLoading: boolean;
  lastUpdated: string;
  getAssetHref?: (contract: string, tokenId: string) => string;
  getActorHref?: (address: string) => string;
  explorerUrl?: string;
  marketplaceHref?: string;
  activitiesHref?: string;
}

export function DiscoverFeedSection({
  orders,
  isLoading,
  activities,
  activitiesLoading,
  lastUpdated,
  getAssetHref = (c, t) => `/asset/${c}/${t}`,
  getActorHref = (a) => `/creator/${a}`,
  explorerUrl = "https://voyager.online",
  marketplaceHref = "/marketplace",
  activitiesHref = "/activities",
}: DiscoverFeedSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* New Listings */}
      <FadeIn>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">Markets</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Tag className="h-4 w-4 text-brand-rose" />
                <h2 className="text-lg font-bold">Activity</h2>
              </div>
            </div>
            <a
              href={marketplaceHref}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
            >
              View all
            </a>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
              No active listings yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {orders.map((o) => (
                <ListingCard key={o.orderHash} order={o} compact />
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* Recent Activity */}
      <FadeIn delay={0.08}>
        <ActivityFeedShell
          title="Community"
          href={activitiesHref}
          hrefLabel="Activities"
          lastUpdated={lastUpdated}
          isLoading={activitiesLoading}
        >
          {activities.map((act, i) => {
            const key = act.txHash
              ? `${act.txHash}-${act.type}-${act.nftTokenId ?? ""}`
              : `activity-${i}`;
            return (
              <ActivityRow
                key={key}
                activity={act}
                showActor
                showExplorer={false}
                compact
                getAssetHref={getAssetHref}
                getActorHref={getActorHref}
                explorerUrl={explorerUrl}
              />
            );
          })}
        </ActivityFeedShell>
      </FadeIn>
    </div>
  );
}
