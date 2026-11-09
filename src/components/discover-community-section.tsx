"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import Link from "./link.js";
import { SectionHeading } from "./section-heading.js";
import { Skeleton } from "./skeleton.js";
import { ActivityRow } from "./activity-row.js";
import { useMedialaneApp } from "./medialane-app.js";
import { LeaderboardPanel } from "./rewards/leaderboard-panel.js";
import { useActivities } from "../utils/use-activities.js";
import { timeAgo } from "../utils/time.js";
import { cn } from "../utils/cn.js";
import { emptyMessages } from "../utils/empty-messages.js";

const FEED_LIMIT = 8;

export function DiscoverCommunitySection() {
  const { activities, isLoading } = useActivities({ limit: FEED_LIMIT });
  const { walletAddress: address } = useMedialaneApp();
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!isLoading) setLastUpdated(new Date().toISOString());
  }, [activities, isLoading]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

      <div className="lg:col-span-7 space-y-4 sm:space-y-5">
        <SectionHeading
          icon={<Activity className="h-4 w-4" />}
          title="Activities"
          subtitle={
            !isLoading && (
              <>
                <RefreshCw className="h-2.5 w-2.5" />
                Updated {timeAgo(lastUpdated)}
              </>
            )
          }
          href="/activities"
          linkLabel="View all"
        />
        <div>
          {isLoading ? (
            <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <Skeleton className="h-9 w-9 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className={cn("rounded-xl border border-border py-12 text-center")}>
              <p className="text-sm font-medium">{emptyMessages.activity.title}</p>
              <p className="text-sm text-muted-foreground">{emptyMessages.activity.description}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
              {activities.map((activity, i) => (
                <ActivityRow
                  key={activity.txHash ? `${activity.txHash}-${activity.type}-${activity.nftTokenId ?? ""}` : `activity-${i}`}
                  activity={activity}
                  showActor
                  showExplorer
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 space-y-4 sm:space-y-5">
        <SectionHeading
          icon={<Sparkles className="h-4 w-4" />}
          title="Rewards"
          href="/rewards"
          linkLabel="Scoreboard"
        />

        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-brand-rose/10 to-brand-orange/10 px-4 py-3">
            <p className="text-sm font-semibold leading-snug">Earn XP. Share the Creator&apos;s Fund.</p>
            <Link
              href="/rewards"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-rose hover:opacity-80 transition-opacity"
            >
              Start earning <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <LeaderboardPanel myAddress={address} limit={5} showHeading={false} compact />
        </div>
      </div>
    </section>
  );
}
