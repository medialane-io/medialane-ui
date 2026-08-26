"use client";

import { Lock, ShieldCheck, Users } from "lucide-react";
import { MedialaneCollectionCard } from "./medialane-collection-card.js";
import { DropStatusBadge, DropSupplyProgress, DropPriceDisplay } from "./drop-status-display.js";
import { DropCountdown } from "./drop-countdown.js";
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

export function DropPreviewCard({
  coverImage, name, symbol, creatorAddress, creatorHref,
  itemCount, conditions, whitelistEnabled, gatedContentEnabled,
}: DropPreviewCardProps) {
  const status = getDropStatus(conditions, 0);

  return (
    <div className="space-y-3">
      <MedialaneCollectionCard
        image={coverImage}
        name={name}
        collection={symbol || "Drop"}
        creator={creatorAddress}
        creatorHref={creatorHref}
      />

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
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <DropPriceDisplay conditions={conditions} />
          </div>
        )}

        {conditions && status === "upcoming" && (
          <DropCountdown targetTs={conditions.startTime} label={whitelistEnabled ? "Whitelist opens in" : "Mint opens in"} />
        )}
      </div>
    </div>
  );
}
