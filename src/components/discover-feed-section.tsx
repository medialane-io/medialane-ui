"use client";

import { Tag, Activity, RefreshCw, ArrowRight } from "lucide-react";
import { FadeIn } from "./motion-primitives.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ActivityCard, ActivityCardSkeleton } from "./activity-card.js";
import { timeAgo } from "../utils/time.js";
import { cn } from "../utils/cn.js";
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
  /** Optional buy hook — when provided, listing cards show their Buy action */
  onBuyOrder?: (order: ApiOrder) => void;
  /** Hide the buy action for orders the viewer owns */
  isOwnOrder?: (order: ApiOrder) => boolean;
}

// ── Shared strip shell: icon-badge header + snap-scroll row ─────────────────
function StripShell({
  icon,
  iconBg,
  title,
  subtitle,
  href,
  linkLabel,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: React.ReactNode;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", iconBg)}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold leading-none">{title}</h2>
            {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        <a
          href={href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
        >
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

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

/** Markets — recent listings carousel. Standalone (2026-07-05) so a page can
 *  place other sections (e.g. Browse by Type) between this and Community. */
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
        icon={<Tag className="h-3.5 w-3.5 text-white" />}
        iconBg="bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/20"
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

/**
 * @deprecated Kept for apps still on the combined layout (e.g. medialane-io,
 * pending its own migration). New pages should use `DiscoverActivityStrip`
 * directly and build their own Community section — see medialane-starknet's
 * discover community-section.tsx for the 2-column activities+leaderboard
 * replacement of the old carousel below.
 */
export function DiscoverFeedSection({
  orders,
  isLoading,
  activities,
  activitiesLoading,
  lastUpdated,
  getAssetHref = (c, t) => `/asset/${c}/${t}`,
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

      {/* Community — recent on-chain activity carousel */}
      <FadeIn delay={0.08}>
        <StripShell
          icon={<Activity className="h-3.5 w-3.5 text-white" />}
          iconBg="bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20"
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
                <p className="text-sm text-muted-foreground py-4">
                  No activity yet. Be the first to trade on Medialane!
                </p>
              )
            : activities.map((act, i) => {
                const key = act.txHash
                  ? `${act.txHash}-${act.type}-${act.nftTokenId ?? ""}`
                  : `activity-${i}`;
                return (
                  <div key={key} className="w-56 sm:w-64 snap-start shrink-0">
                    <ActivityCard activity={act} getAssetHref={getAssetHref} />
                  </div>
                );
              })}
        </StripShell>
      </FadeIn>
    </div>
  );
}
