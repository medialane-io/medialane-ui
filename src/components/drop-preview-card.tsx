"use client";

import { Calendar, Lock, ShieldCheck, Users } from "lucide-react";
import { MedialaneCollectionCard } from "./medialane-collection-card.js";
import { DropStatusBadge, DropSupplyProgress, DropPriceDisplay } from "./drop-status-display.js";
import { getDropStatus, type DropConditions } from "../utils/drop-status.js";

export interface DropPreviewCardProps {
  coverImage: string | null;
  name: string;
  symbol: string;
  creatorAddress?: string;
  creatorHref?: string;
  itemCount: number;
  conditions: DropConditions | null;
  whitelistEnabled: boolean;
  gatedContentEnabled: boolean;
}

function formatTs(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DropPreviewCard({
  coverImage, name, symbol, creatorAddress, creatorHref,
  itemCount, conditions, whitelistEnabled, gatedContentEnabled,
}: DropPreviewCardProps) {
  const status = getDropStatus(conditions, 0);
  const maxPerWallet = conditions ? parseInt(conditions.maxPerWallet, 10) : 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <MedialaneCollectionCard
          image={coverImage}
          name={name}
          collection={symbol || "Drop"}
          creator={creatorAddress}
          creatorHref={creatorHref}
        />
        <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
          Drop
        </span>
      </div>

      <div className="bento-cell p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <DropStatusBadge status={status} />
          {whitelistEnabled && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-orange bg-brand-orange/10 rounded-full px-2 py-0.5">
              <Users className="h-3 w-3" />
              Whitelist
            </span>
          )}
          {gatedContentEnabled && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 rounded-full px-2 py-0.5">
              <Lock className="h-3 w-3" />
              Exclusive content
            </span>
          )}
        </div>

        <DropSupplyProgress minted={0} max={itemCount} />

        {conditions && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <DropPriceDisplay conditions={conditions} />
            </div>
            {maxPerWallet > 0 && (
              <span className="text-xs text-muted-foreground">Max {maxPerWallet}/wallet</span>
            )}
          </div>
        )}

        {conditions && conditions.startTime > 0 && conditions.endTime > 0 && (
          <div className="space-y-1 text-xs text-muted-foreground border-t border-border/60 pt-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              Opens: {formatTs(conditions.startTime)}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              Closes: {formatTs(conditions.endTime)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
