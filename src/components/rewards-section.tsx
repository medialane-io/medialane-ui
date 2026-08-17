"use client";

import Link from "next/link";
import { ArrowRight, Zap, Coins, Gift } from "lucide-react";

export interface RewardsSectionProps {
  rewardsHref: string;
}

const pillars = [
  {
    icon: Zap,
    label: "XP",
    detail: "Earned for every mint, trade, and connection you make.",
  },
  {
    icon: Coins,
    label: "Creator's Fund",
    detail: "Your XP grows your share of the shared pool.",
  },
  {
    icon: Gift,
    label: "Airdrop",
    detail: "Claim your share on-chain, every round.",
  },
];

export function RewardsSection({ rewardsHref }: RewardsSectionProps) {
  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-brand-orange to-brand-maeve">
      <section className="rounded-[15px] bg-background px-7 py-8 sm:px-9">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-14">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground">
              Rewards
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
              Every action earns XP. Active members receive a growing share of the
              Creator&apos;s Fund, claimed as an airdrop each round.
            </p>

            <Link
              href={rewardsHref}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-maeve px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
            >
              View your rewards
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:w-[300px] shrink-0 lg:border-l lg:border-border lg:pl-10">
            {pillars.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-orange/15 to-brand-maeve/15 text-brand-maeve shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
