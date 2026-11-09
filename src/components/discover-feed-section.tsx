"use client";

import { Tag, Activity, RefreshCw } from "lucide-react";
import { SectionHeading, type SectionHeadingProps } from "./section-heading.js";
import { FadeIn } from "./motion-primitives.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ActivityCard, ActivityCardSkeleton } from "./activity-card.js";
import { timeAgo } from "../utils/time.js";
import type { ApiOrder, ApiActivity } from "@medialane/sdk";
import { emptyMessages } from "../utils/empty-messages.js";

export interface DiscoverFeedSectionProps {
  orders: ApiOrder[];
  isLoading: boolean;
  activities: ApiActivity[];
  activitiesLoading: boolean;
  lastUpdated: string;
  explorerUrl?: string;
  marketplaceHref?: string;
  activitiesHref?: string;

  onBuyOrder?: (order: ApiOrder) => void;

  isOwnOrder?: (order: ApiOrder) => boolean;
}

function StripShell({
  children,
  ...heading
}: SectionHeadingProps & { children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <SectionHeading {...heading} />

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-5 sm:gap-6 snap-x snap-mandatory pb-2" style={{ width: "max-content" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

export interface DiscoverActivityStripProps {
  orders: ApiOrder[];
  isLoading: boolean;
  marketplaceHref?: string;
  onBuyOrder?: (order: ApiOrder) => void;
  isOwnOrder?: (order: ApiOrder) => boolean;
}

export function DiscoverActivityStrip({
  orders,
  isLoading,
  marketplaceHref = "/marketplace",
  onBuyOrder,
  isOwnOrder,
}: DiscoverActivityStripProps) {
  return (
    <FadeIn>
      <StripShell
        icon={<Tag className="h-4 w-4" />}
        title="Activity"
        href={marketplaceHref}
        linkLabel="View all"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-72 snap-start shrink-0">
                <ListingCardSkeleton />
              </div>
            ))
          : orders.length === 0
          ? (
              <p className="text-sm text-muted-foreground py-4">No active listings yet.</p>
            )
          : orders.map((order) => {
              const own = isOwnOrder?.(order) ?? false;
              return (
                <div key={order.orderHash} className="w-72 snap-start shrink-0">
                  <ListingCard
                    order={order}
                    onBuy={onBuyOrder && !own ? () => onBuyOrder(order) : undefined}
                  />
                </div>
              );
            })}
      </StripShell>
    </FadeIn>
  );
}

export function DiscoverFeedSection({
  orders,
  isLoading,
  activities,
  activitiesLoading,
  lastUpdated,
  marketplaceHref = "/marketplace",
  activitiesHref = "/activities",
  onBuyOrder,
  isOwnOrder,
}: DiscoverFeedSectionProps) {
  return (
    <div className="space-y-14 sm:space-y-20">
      <DiscoverActivityStrip
        orders={orders}
        isLoading={isLoading}
        marketplaceHref={marketplaceHref}
        onBuyOrder={onBuyOrder}
        isOwnOrder={isOwnOrder}
      />

      <FadeIn delay={0.08}>
        <StripShell
          icon={<Activity className="h-4 w-4" />}
          title="Community"
          subtitle={
            <span className="flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5" />
              Updated {timeAgo(lastUpdated)}
            </span>
          }
          href={activitiesHref}
          linkLabel="Activities"
        >
          {activitiesLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-56 sm:w-64 snap-start shrink-0">
                  <ActivityCardSkeleton />
                </div>
              ))
            : activities.length === 0
            ? (
                <div className="py-4">
                  <p className="text-sm font-medium">{emptyMessages.activity.title}</p>
                  <p className="text-sm text-muted-foreground">{emptyMessages.activity.description}</p>
                </div>
              )
            : activities.map((act, i) => {
                const key = act.txHash
                  ? `${act.txHash}-${act.type}-${act.nftTokenId ?? ""}`
                  : `activity-${i}`;
                return (
                  <div key={key} className="w-56 sm:w-64 snap-start shrink-0">
                    <ActivityCard activity={act} />
                  </div>
                );
              })}
        </StripShell>
      </FadeIn>
    </div>
  );
}
