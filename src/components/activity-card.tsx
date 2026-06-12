"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CurrencyIcon } from "./currency-icon.js";
import { ACTIVITY_TYPE_CONFIG } from "../data/activity.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { timeAgo } from "../utils/time.js";
import { formatDisplayPrice } from "../utils/format.js";
import { cn } from "../utils/cn.js";
import type { ApiActivity } from "@medialane/sdk";

/** ui's pinned SDK lags the apps — extend structurally for fields newer SDKs carry. */
type ActivityWithEnrichment = ApiActivity & {
  token?: { name: string | null; image: string | null } | null;
  amount?: string;
};

export const ACTIVITY_MESSAGES: Record<string, (actor: string | null) => string> = {
  mint:      (actor) => actor ? `Minted by ${actor}` : "Newly minted",
  listing:   (actor) => actor ? `Listed by ${actor}` : "Listed for sale",
  sale:      (actor) => actor ? `Purchased by ${actor}` : "Sold",
  offer:     (actor) => actor ? `Offer by ${actor}` : "Offer placed",
  transfer:  (actor) => actor ? `Transferred by ${actor}` : "Transferred",
  cancelled: (actor) => actor ? `Cancelled by ${actor}` : "Listing cancelled",
};

export function ActivityCardSkeleton() {
  return (
    <div className="card-base">
      <div className="aspect-square w-full bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

export interface ActivityCardProps {
  activity: ApiActivity;
  /** Builds the asset link; card is unlinked when the activity has no token ref */
  getAssetHref?: (contract: string, tokenId: string) => string;
}

/** Card-shaped activity item for horizontal carousels (Discover Community strip).
 *  Same data as ActivityRow, presented like a collection/listing card. */
export function ActivityCard({
  activity: rawActivity,
  getAssetHref = (c, t) => `/asset/${c}/${t}`,
}: ActivityCardProps) {
  const activity = rawActivity as ActivityWithEnrichment;
  const config = ACTIVITY_TYPE_CONFIG[activity.type] ?? {
    label: activity.type,
    variant: "outline" as const,
    icon: ExternalLink,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  };
  const Icon = config.icon;

  const contract = activity.nftContract ?? activity.contractAddress ?? null;
  const tokenId = activity.nftTokenId ?? activity.tokenId ?? null;
  const actor =
    activity.offerer ??
    activity.fulfiller ??
    ((activity.type as string) === "mint" ? activity.to : activity.from) ??
    null;

  const tokenName = activity.token?.name ?? (tokenId ? `#${tokenId}` : "—");
  const rawImage = activity.token?.image ?? null;
  const tokenImage = rawImage ? ipfsToHttp(rawImage) : null;
  const amount = activity.amount && Number(activity.amount) > 1 ? activity.amount : null;

  const shortActor = actor
    ? actor.length > 10
      ? `${actor.slice(0, 6)}…${actor.slice(-4)}`
      : actor
    : null;
  const message = ACTIVITY_MESSAGES[activity.type]?.(shortActor) ?? config.label;

  const body = (
    <>
      <div className="aspect-square relative bg-muted">
        {tokenImage ? (
          <Image
            src={tokenImage}
            alt={tokenName}
            fill
            sizes="256px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5" aria-hidden />
        )}
        {/* Activity type chip — vivid label on glass */}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-background/75 backdrop-blur-md border border-border/40">
          <Icon className={cn("h-3 w-3", config.colorClass)} aria-hidden />
          <span className={config.colorClass}>{config.label}</span>
        </span>
        {amount && (
          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500 text-white">
            ×{amount}
          </span>
        )}
      </div>
      <div className="p-4 space-y-1.5">
        <p className="text-[15px] font-semibold truncate">{tokenName}</p>
        <p
          className="text-xs text-muted-foreground truncate"
          title={new Date(activity.timestamp).toLocaleString()}
        >
          {message} · {timeAgo(activity.timestamp)}
        </p>
        {activity.price?.formatted && (
          <p className="text-sm font-bold tabular-nums flex items-center gap-1.5 pt-0.5">
            {activity.price.currency && <CurrencyIcon symbol={activity.price.currency} size={13} aria-hidden />}
            {formatDisplayPrice(activity.price.formatted)}
          </p>
        )}
      </div>
    </>
  );

  const className = "card-base block active:scale-[0.99] transition-all";

  return contract && tokenId ? (
    <Link href={getAssetHref(contract, tokenId)} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
