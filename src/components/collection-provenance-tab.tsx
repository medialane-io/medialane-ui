"use client";

import { useState, useEffect, useMemo } from "react";
import type { ApiActivity } from "@medialane/sdk";
import { assetHref, profileHref } from "@medialane/sdk";
import { ExternalLink, Inbox } from "lucide-react";
import Image from "./image.js";
import Link from "./link.js";
import { AddressDisplay } from "./address-display.js";
import { CurrencyIcon } from "./currency-icon.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { useActivities } from "../utils/use-activities.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { ACTIVITY_TYPE_CONFIG } from "../data/activity.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { formatDisplayPrice } from "../utils/format.js";
import { timeAgo } from "../utils/time.js";
import { cn } from "../utils/cn.js";

const PAGE_SIZE = 30;

const EVENT_TITLE: Record<string, string> = {
  mint: "Minted",
  listing: "Listed for sale",
  sale: "Purchased",
  offer: "Offer made",
  transfer: "Transferred",
  cancelled: "Listing cancelled",
};

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function groupByDay(events: ApiActivity[]) {
  const groups: { label: string; events: ApiActivity[] }[] = [];
  for (const event of events) {
    const label = dayLabel(event.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.events.push(event);
    else groups.push({ label, events: [event] });
  }
  return groups;
}

function ProvenanceEvent({ event, showAsset }: { event: ApiActivity; showAsset: boolean }) {
  const resolveImage = useImageUrl();
  const config = ACTIVITY_TYPE_CONFIG[event.type];
  const Icon = config?.icon ?? ExternalLink;
  const contract = event.nftContract ?? event.contractAddress ?? null;
  const tokenId = event.nftTokenId ?? event.tokenId ?? null;
  const actor =
    event.offerer ?? event.fulfiller ?? (event.type === "mint" ? event.to : event.from) ?? null;
  const amount = event.amount && Number(event.amount) > 1 ? event.amount : null;
  const name = event.token?.name ?? (tokenId ? `#${tokenId}` : null);
  const image = resolveImage(event.token?.image ?? null);

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-colors hover:bg-card/90">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          config?.bgClass ?? "bg-muted"
        )}
        aria-hidden
      >
        <Icon className={cn("h-5 w-5", config?.colorClass ?? "text-muted-foreground")} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-1.5 text-base font-semibold leading-tight">
          {EVENT_TITLE[event.type] ?? event.type}
          {amount ? <span className="text-sm font-medium text-muted-foreground">×{amount}</span> : null}
          {actor ? (
            <span className="text-sm font-normal text-muted-foreground">
              by{" "}
              <Link
                href={profileHref({ address: actor })}
                className="font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <AddressDisplay address={actor} chars={6} showCopy={false} className="text-sm" />
              </Link>
            </span>
          ) : null}
        </p>

        {showAsset && name ? (
          <Link
            href={contract && tokenId ? assetHref(event.chain ?? "STARKNET", contract, tokenId) : "#"}
            className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-muted/70 py-1 pl-1 pr-3 hover:bg-muted transition-colors"
          >
            <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-muted">
              {image ? (
                <Image src={image} alt="" width={24} height={24} className="h-full w-full object-cover" unoptimized />
              ) : null}
            </span>
            <span className="truncate text-xs font-medium">{name}</span>
          </Link>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {event.price?.formatted ? (
          <span className="flex items-center gap-1.5 text-base font-bold tabular-nums">
            {event.price.currency ? <CurrencyIcon symbol={event.price.currency} size={15} aria-hidden /> : null}
            {formatDisplayPrice(event.price.formatted)}
            {event.price.currency ? (
              <span className="text-xs font-medium text-muted-foreground">{event.price.currency}</span>
            ) : null}
          </span>
        ) : null}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <time dateTime={event.timestamp} title={new Date(event.timestamp).toLocaleString()}>
            {timeAgo(event.timestamp)}
          </time>
          {event.txHash ? (
            <a
              href={`${EXPLORER_URL}/tx/${event.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-1 hover:bg-muted hover:text-foreground transition-colors"
              aria-label="View transaction"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </span>
      </div>
    </li>
  );
}

function ProvenanceSkeleton() {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card/60 p-4">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-44 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export interface CollectionProvenanceTabProps {
  contract: string;
}

export function CollectionProvenanceTab({ contract }: CollectionProvenanceTabProps) {
  const [page, setPage] = useState(1);
  const [all, setAll] = useState<ApiActivity[]>([]);
  const { activities, meta, isLoading } = useActivities({ contract, page, limit: PAGE_SIZE });

  useEffect(() => {
    if (activities.length === 0) return;
    setAll((prev) => (page === 1 ? activities : [...prev, ...activities]));
  }, [activities, page]);

  const groups = useMemo(() => groupByDay(all), [all]);
  const showAsset = useMemo(
    () => new Set(all.map((e) => e.nftTokenId ?? e.tokenId ?? "")).size > 1,
    [all]
  );
  const hasMore = meta ? all.length < (meta.total ?? 0) : false;

  if (isLoading && all.length === 0) return <ProvenanceSkeleton />;

  if (all.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No history yet</p>
        <p className="text-xs text-muted-foreground/70 max-w-xs">
          Mints, transfers, listings and sales will appear here as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="mb-3 font-display text-lg font-bold">{group.label}</h3>
          <ol className="space-y-2.5">
            {group.events.map((event, i) => (
              <ProvenanceEvent
                key={`${event.txHash ?? event.orderHash}-${event.type}-${i}`}
                event={event}
                showAsset={showAsset}
              />
            ))}
          </ol>
        </section>
      ))}
      <LoadMoreSentinel hasMore={hasMore} isLoading={isLoading} onLoadMore={() => setPage((p) => p + 1)} />
    </div>
  );
}
