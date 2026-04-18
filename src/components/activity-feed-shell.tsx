"use client";

import Link from "next/link";
import { ArrowRight, Activity, RefreshCw } from "lucide-react";
import { timeAgo } from "../utils/time.js";

export interface ActivityFeedShellProps {
  title: string;
  href: string;
  hrefLabel?: string;
  lastUpdated: string;
  isLoading: boolean;
  children: React.ReactNode;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="h-7 w-7 rounded-lg bg-muted animate-pulse shrink-0" />
      <div className="h-7 w-7 rounded-md bg-muted animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-1 text-right">
        <div className="h-3.5 w-14 bg-muted animate-pulse rounded" />
        <div className="h-2.5 w-8 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-3 w-10 bg-muted animate-pulse rounded hidden sm:block" />
    </div>
  );
}

export function ActivityFeedShell({ title, href, hrefLabel = "Activities", lastUpdated, isLoading, children }: ActivityFeedShellProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Activity className="h-4 w-4 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black leading-none">{title}</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5" />
              Updated {timeAgo(lastUpdated)}
            </p>
          </div>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors">
          {hrefLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="bento-cell overflow-hidden divide-y divide-border/40">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : !children || (Array.isArray(children) && children.length === 0) ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
