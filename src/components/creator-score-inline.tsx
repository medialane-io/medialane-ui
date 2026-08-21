"use client";

import Link from "./link.js";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { LevelBadge } from "./rewards/level-badge.js";
import { BadgeShelf } from "./rewards/badge-shelf.js";
import { useRewards } from "../utils/use-rewards.js";

export interface CreatorScoreInlineProps {
  getClient: () => MedialaneClient;
  address: string | null | undefined;
  size?: "sm" | "md" | "lg";

  showBadges?: boolean;

  maxBadges?: number;
  className?: string;
}

export function CreatorScoreInline({ getClient, address, size = "sm", showBadges = false, maxBadges = 6, className }: CreatorScoreInlineProps) {
  const { data } = useRewards(getClient, address);
  if (!data || data.totalXp <= 0) return null;

  return (
    <div className={className}>
      <Link href="/rewards" className="inline-flex active:opacity-80">
        <LevelBadge level={data.currentLevel} name={data.currentLevelName} badgeColor={data.badgeColor} size={size} />
      </Link>
      {showBadges && data.badges.length > 0 && (
        <BadgeShelf badges={data.badges.slice(0, maxBadges)} className="mt-2" />
      )}
    </div>
  );
}
