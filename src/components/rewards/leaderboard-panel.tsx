"use client";

import { Sparkles } from "lucide-react";
import { normalizeAddress, profileHref } from "@medialane/sdk";
import Image from "../image.js";
import Link from "../link.js";
import { Skeleton } from "../skeleton.js";
import { AddressDisplay } from "../address-display.js";
import { LeaderboardTable } from "./leaderboard-table.js";
import { cn } from "../../utils/cn.js";
import { profileIdentity } from "../../utils/profile-identity.js";
import { useCreatorProfile } from "../../utils/use-profiles.js";
import { useImageUrl } from "../../utils/use-image-url.js";
import { useLeaderboard } from "../../utils/use-rewards.js";

export interface LeaderboardPanelProps {
  myAddress?: string | null;
  limit?: number;
  showHeading?: boolean;
  viewAllHref?: string;
  compact?: boolean;
  className?: string;
}

function CreatorIdentity({ address, compact }: { address: string; compact?: boolean }) {
  const { profile } = useCreatorProfile(address);
  const avatarUrl = useImageUrl()(profile?.avatarImage, { width: 96 });
  const { identity: name } = profileIdentity({
    username: profile?.username,
    name: profile?.name,
    walletAddress: address,
  });

  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <span className={cn("relative shrink-0 overflow-hidden rounded-full bg-foreground/[0.08]", compact ? "h-7 w-7" : "h-9 w-9")}>
        <Image
          src={avatarUrl ?? "/icon.png"}
          alt=""
          fill
          unoptimized
          className={avatarUrl ? "object-cover" : "object-cover p-[15%] opacity-50"}
        />
      </span>
      {name ? (
        <span className={cn("truncate font-bold", compact ? "text-sm font-semibold" : "text-base")}>{name}</span>
      ) : (
        <AddressDisplay address={address} chars={4} showCopy={false} className={compact ? "text-sm font-semibold" : "text-base font-bold"} />
      )}
    </span>
  );
}

export function LeaderboardPanel({
  myAddress,
  limit = 20,
  showHeading = true,
  viewAllHref,
  compact,
  className,
}: LeaderboardPanelProps) {
  const { data, isLoading } = useLeaderboard(1, limit);
  const rows = data?.data ?? [];

  const highlightAddress = myAddress ? normalizeAddress("STARKNET", myAddress) : null;

  return (
    <div className={cn(compact ? "" : "space-y-3", className)}>
      {showHeading && (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-rose to-brand-orange text-white shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-black">Community Rewards</h2>
        </div>
      )}

      {isLoading ? (
        <div className={compact ? "divide-y divide-border/40" : "space-y-1.5"}>
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <Skeleton key={i} className={compact ? "h-11 w-full rounded-none" : "h-10 w-full rounded-lg"} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className={cn("text-sm text-muted-foreground py-4", compact && "px-4")}>
          Nobody&apos;s earned points yet — be the first.
        </p>
      ) : (
        <LeaderboardTable
          entries={rows}
          highlightAddress={highlightAddress}
          compact={compact}
          renderAddress={(address) => (
            <Link href={profileHref({ address })} className="hover:text-foreground transition-colors">
              <CreatorIdentity address={address} compact={compact} />
            </Link>
          )}
        />
      )}

      {viewAllHref && rows.length > 0 && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          View scoreboard →
        </Link>
      )}
    </div>
  );
}
