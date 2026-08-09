"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AddressDisplay } from "./address-display.js";

export interface CommunityRewardsEntry {
  address: string;
  totalXp: number;
}

export interface CreatorsFundSectionProps {
  /** Route of the airdrop claim page. */
  airdropHref: string;
  /** Route of the rewards/leaderboard page. */
  rewardsHref: string;
  creatorHref: (address: string) => string;
  entries: CommunityRewardsEntry[];
  isLoading?: boolean;
}

/** Home-page teaser for the Creator's Fund — merges what were two separate,
 *  visually near-identical sections (airdrop CTA + XP leaderboard) into one:
 *  join the airdrop, earn XP for everything you do, see who's leading. */
export function CreatorsFundSection({
  airdropHref,
  rewardsHref,
  creatorHref,
  entries,
  isLoading = false,
}: CreatorsFundSectionProps) {
  return (
    <section className="rounded-2xl bg-muted/50 dark:bg-card overflow-hidden grid lg:grid-cols-2 max-lg:divide-y lg:divide-x divide-brand-orange/20">

      {/* Left — pitch + CTAs */}
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
            Every dollar comes back to{" "}
            <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange bg-clip-text text-transparent">
              you
            </span>
          </h2>
          <p className="mt-2.5 text-base text-muted-foreground leading-relaxed max-w-md">
            Join the airdrop, then earn XP for everything you create and trade.
            Your share of every distribution follows you automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={airdropHref} className="btn-border-animated p-[1px] rounded-xl">
            <span className="flex items-center justify-center gap-2 rounded-[11px] h-12 px-5 text-sm font-semibold text-white bg-transparent hover:brightness-110 active:scale-[0.98] transition-all">
              <Sparkles className="h-4 w-4" />
              Claim my spot
            </span>
          </Link>
          <Link
            href={rewardsHref}
            className="inline-flex items-center gap-1.5 h-12 px-5 rounded-xl text-sm font-semibold text-foreground border border-border hover:border-brand-orange/40 hover:text-brand-orange transition-colors"
          >
            See the leaderboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Right — leaderboard preview */}
      <div className="p-5 sm:p-6">
        {!isLoading && entries.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 h-full">
            {entries.slice(0, 4).map((entry, i) => (
              <Link
                key={entry.address}
                href={creatorHref(entry.address)}
                className="group relative rounded-xl bg-card dark:bg-muted/30 hover:bg-card/70 dark:hover:bg-muted/50 overflow-hidden transition-colors flex flex-col justify-between p-4"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-orange/40" />
                <span className="text-[11px] font-bold text-muted-foreground/60">#{i + 1}</span>
                <div className="space-y-0.5">
                  <p className="text-3xl font-black tabular-nums leading-none">
                    {entry.totalXp.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">XP earned</p>
                </div>
                <AddressDisplay
                  address={entry.address}
                  chars={4}
                  showCopy={false}
                  className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 h-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-h-[110px] rounded-xl bg-card dark:bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
