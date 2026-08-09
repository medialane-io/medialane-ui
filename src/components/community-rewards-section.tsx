"use client";

import Link from "next/link";
import { ArrowRight, Zap, Palette, ShoppingBag, MessageSquare } from "lucide-react";
import { AddressDisplay } from "./address-display.js";

export interface CommunityRewardsEntry {
  address: string;
  totalXp: number;
}

export interface CommunityRewardsSectionProps {
  entries: CommunityRewardsEntry[];
  isLoading?: boolean;
  rewardsHref: string;
  creatorHref: (address: string) => string;
}

const EARN_ACTIONS = [
  { icon: Zap, label: "Mint" },
  { icon: Palette, label: "Create" },
  { icon: ShoppingBag, label: "Trade" },
  { icon: MessageSquare, label: "Engage" },
];

const INFO_TILES = [
  { value: "50", label: "Levels" },
  { value: "XP", label: "Every action" },
  { value: "Fund", label: "Distribution" },
];

export function CommunityRewardsSection({
  entries,
  isLoading = false,
  rewardsHref,
  creatorHref,
}: CommunityRewardsSectionProps) {
  return (
    <section className="rounded-2xl bg-muted/50 dark:bg-card overflow-hidden grid lg:grid-cols-2 max-lg:divide-y lg:divide-x divide-brand-orange/20">

      {/* Left — info panel */}
      <div className="px-7 py-8 sm:px-9 flex flex-col gap-6">
        <div>
          {/* Creator's Fund eyebrow — shared with CreatorAirdropBanner */}
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Creator&apos;s Fund
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight leading-tight">
            Community Rewards
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            Earn XP. Share the Creator&apos;s Fund.
          </p>
        </div>

        {/* Info values — hairline-divided row */}
        <div className="grid grid-cols-3 divide-x divide-brand-orange/20 border-y border-brand-orange/20 py-4">
          {INFO_TILES.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-1 px-2">
              <span className="text-xl font-black tabular-nums">{value}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Earn actions — plain text row */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {EARN_ACTIONS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <Icon className="h-3 w-3 text-brand-orange/70" />
              {label}
            </span>
          ))}
        </div>

        <Link
          href={rewardsHref}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Start earning XP
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Right — member cards */}
      <div className="p-5 sm:p-6">
        {!isLoading && entries.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 h-full">
            {entries.slice(0, 4).map((entry) => (
              <Link
                key={entry.address}
                href={creatorHref(entry.address)}
                className="group relative rounded-xl bg-card dark:bg-muted/30 hover:bg-card/70 dark:hover:bg-muted/50 overflow-hidden transition-colors flex flex-col justify-between p-4"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-orange/40" />

                {/* XP — hero number */}
                <div className="space-y-0.5 pt-1">
                  <p className="text-2xl font-black tabular-nums leading-none">
                    {entry.totalXp.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">XP earned</p>
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
              <div key={i} className="min-h-[100px] rounded-xl bg-card dark:bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
