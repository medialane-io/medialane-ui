"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Activity, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import Link from "./link.js";
import { Skeleton } from "./skeleton.js";
import { ActivityRow } from "./activity-row.js";
import { useMedialaneApp } from "./medialane-app.js";
import { LeaderboardPanel } from "./rewards/leaderboard-panel.js";
import { useActivities } from "../utils/use-activities.js";
import { timeAgo } from "../utils/time.js";
import { emptyMessages } from "../utils/empty-messages.js";

const ROWS = 5;

function CommunityCard({
  icon,
  title,
  subtitle,
  href,
  linkLabel,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: ReactNode;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-none tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 flex h-3.5 items-center gap-1 text-2xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {linkLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="min-h-[324px]">{children}</div>
    </section>
  );
}

export function DiscoverCommunitySection() {
  const { activities, isLoading } = useActivities({ limit: ROWS });
  const { walletAddress: address } = useMedialaneApp();
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!isLoading) setLastUpdated(new Date().toISOString());
  }, [activities, isLoading]);

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <CommunityCard
        icon={<Activity />}
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
      >
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: ROWS }).map((_, i) => (
              <div key={i} className="flex h-16 items-center gap-3 px-4">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium">{emptyMessages.activity.title}</p>
            <p className="text-sm text-muted-foreground">{emptyMessages.activity.description}</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
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
      </CommunityCard>

      <CommunityCard
        icon={<Sparkles />}
        title="Rewards"
        subtitle="Earn XP. Share the Creator's Fund."
        href="/rewards"
        linkLabel="Scoreboard"
      >
        <LeaderboardPanel myAddress={address} limit={ROWS} showHeading={false} compact />
      </CommunityCard>
    </section>
  );
}
