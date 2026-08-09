"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Palette, ShoppingBag, MessageSquare, Crown } from "lucide-react";
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

const EARN_ACTIONS = [
  { icon: Zap, label: "Mint" },
  { icon: Palette, label: "Create" },
  { icon: ShoppingBag, label: "Trade" },
  { icon: MessageSquare, label: "Engage" },
];

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
    <section className="relative rounded-2xl bg-muted/50 dark:bg-card overflow-hidden grid lg:grid-cols-2 max-lg:divide-y lg:divide-x divide-brand-orange/20">
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b7bff, transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #fb8b46, transparent 70%)" }}
        aria-hidden
      />

      {/* Left — pitch + how to earn + CTAs */}
      <div className="relative px-7 py-9 sm:px-9 flex flex-col gap-6">
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
            Every dollar comes back to <span className="text-brand-orange">you</span>
          </h2>
          <p className="mt-2.5 text-base text-muted-foreground leading-relaxed max-w-md">
            Sign up for the airdrop, then earn XP for everything you do — up to
            level 50. Your share of every $1,000 distribution follows you
            automatically.
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
            See the leaderboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/70">
          Free to join · No card required · Eligible for every distribution
        </p>
      </div>

      {/* Right — leaderboard preview */}
      <div className="relative p-5 sm:p-6">
        {!isLoading && entries.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 h-full">
            {entries.slice(0, 4).map((entry, i) => (
              <Link
                key={entry.address}
                href={creatorHref(entry.address)}
                className="group relative rounded-xl bg-card dark:bg-muted/30 hover:bg-card/70 dark:hover:bg-muted/50 overflow-hidden transition-colors flex flex-col justify-between p-4"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-0.5 ${
                    i === 0 ? "bg-gradient-to-r from-brand-orange to-brand-rose" : "bg-brand-orange/30"
                  }`}
                />
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground/60">
                  {i === 0 && <Crown className="h-3 w-3 text-brand-orange" />}
                  #{i + 1}
                </span>
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
