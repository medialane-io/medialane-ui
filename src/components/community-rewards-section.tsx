"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CommunityRewardsSectionProps {
  rewardsHref: string;
  airdropHref: string;
}

export function CommunityRewardsSection({ rewardsHref, airdropHref }: CommunityRewardsSectionProps) {
  return (
    <section className="rounded-2xl bg-muted/50 dark:bg-card px-7 py-8 sm:px-9">
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
    </section>
  );
}
