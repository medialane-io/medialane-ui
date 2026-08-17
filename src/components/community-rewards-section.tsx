"use client";

import Link from "next/link";
import { ArrowRight, PenLine, TrendingUp, Gift } from "lucide-react";

export interface CommunityRewardsSectionProps {
  rewardsHref: string;
  airdropHref: string;
}

const steps = [
  {
    icon: PenLine,
    label: "Create or trade",
    detail: "Mint, license, or sell IP on Medialane.",
  },
  {
    icon: TrendingUp,
    label: "Earn a share",
    detail: "Every action grows your standing in the pool.",
  },
  {
    icon: Gift,
    label: "Claim each round",
    detail: "Your share is yours to claim, on-chain.",
  },
];

export function CommunityRewardsSection({ rewardsHref, airdropHref }: CommunityRewardsSectionProps) {
  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-brand-orange to-brand-maeve">
      <section className="rounded-[15px] bg-background px-7 py-8 sm:px-9">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-14">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-maeve">
              Creator&apos;s Fund
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight leading-tight">
              How it works
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-lg">
              A share of what Medialane earns is set aside in one public wallet and shared back
              with the people creating and trading here — the more you do, the bigger your share,
              every round.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={rewardsHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-brand-maeve transition-colors"
              >
                See your rewards
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={airdropHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                How the fund works
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:w-[300px] shrink-0 lg:border-l lg:border-border lg:pl-10">
            {steps.map(({ icon: Icon, label, detail }) => (
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
