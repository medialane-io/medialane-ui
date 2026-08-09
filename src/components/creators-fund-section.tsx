"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Palette, ShoppingBag, MessageSquare } from "lucide-react";
import { LevelBadge } from "./rewards/level-badge.js";

export interface CreatorsFundLeaderboardEntry {
  address: string;
  totalXp: number;
  currentLevel: number;
  currentLevelName: string;
  badgeColor: string;
}

export interface CreatorsFundSectionProps {
  /** Route of the airdrop claim page. */
  airdropHref: string;
  /** Route of the rewards/leaderboard page. */
  rewardsHref: string;
  creatorHref: (address: string) => string;
  entries: CreatorsFundLeaderboardEntry[];
  isLoading?: boolean;
}

const EARN_ACTIONS = [
  { icon: Zap, label: "Mint" },
  { icon: Palette, label: "Create" },
  { icon: ShoppingBag, label: "Trade" },
  { icon: MessageSquare, label: "Engage" },
];

/** Home-page teaser for the Creator's Fund — merges what were two separate,
 *  visually near-identical sections (airdrop CTA + community leaderboard)
 *  into one. Uses the real level system (LevelBadge) instead of raw XP
 *  numbers or a ranked podium — this is participation, not competition, per
 *  LeaderboardTable's own convention. */
export function CreatorsFundSection({
  airdropHref,
  rewardsHref,
  creatorHref,
  entries,
  isLoading = false,
}: CreatorsFundSectionProps) {
  return (
    <section className="rounded-2xl bg-muted/50 dark:bg-card overflow-hidden grid lg:grid-cols-2 max-lg:divide-y lg:divide-x divide-border">

      {/* Left — pitch + how to earn + CTAs */}
      <div className="px-7 py-9 sm:px-9 flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Creator&apos;s Fund
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
            Live
          </span>
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            The more you create, the bigger your share.
          </h2>
          <p className="mt-2.5 text-base text-muted-foreground leading-relaxed max-w-md">
            Every mint, listing, and trade earns XP and levels you up. When
            the fund pays out, your level decides your share.
          </p>
        </div>

        {/* How you earn XP */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {EARN_ACTIONS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-brand-orange/70" />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={airdropHref}
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl text-sm font-semibold text-white bg-brand-orange hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Claim my spot
          </Link>
          <Link
            href={rewardsHref}
            className="inline-flex items-center gap-1.5 h-12 px-5 rounded-xl text-sm font-semibold text-foreground border border-border hover:border-brand-orange/40 hover:text-brand-orange transition-colors"
          >
            See my level
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/70">
          Free to join · No card required · Every $1,000 the fund earns gets split among participants
        </p>
      </div>

      {/* Right — community levels, no ranking */}
      <div className="px-5 py-6 sm:px-6 flex flex-col">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Recently leveled up</p>
        {!isLoading && entries.length > 0 ? (
          <div className="flex-1 rounded-xl border border-border overflow-hidden">
            {entries.slice(0, 5).map((entry) => (
              <Link
                key={entry.address}
                href={creatorHref(entry.address)}
                className="flex items-center gap-3 border-b border-border/60 bg-card px-3.5 py-3 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {entry.address.slice(0, 6)}…{entry.address.slice(-4)}
                </span>
                <LevelBadge
                  level={entry.currentLevel}
                  name={entry.currentLevelName}
                  badgeColor={entry.badgeColor}
                  size="sm"
                />
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {entry.totalXp.toLocaleString()} XP
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[46px] rounded-xl bg-card dark:bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
