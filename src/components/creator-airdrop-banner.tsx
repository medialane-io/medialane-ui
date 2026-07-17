"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CreatorAirdropBannerProps {
  /** Route of the airdrop claim page. */
  href: string;
}

const HIGHLIGHTS = [
  "Free and frictionless participation",
  "Eligible for every prize distribution",
  "Create, trade and earn more rewards",
];

export function CreatorAirdropBanner({ href }: CreatorAirdropBannerProps) {
  return (
    <section className="rounded-2xl bg-muted/50 dark:bg-card px-7 py-8 sm:px-9">
      {/* Creator's Fund eyebrow — shared with CommunityRewardsSection */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          Creator&apos;s Fund
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
          Live
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            Creator&apos;s Airdrop
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md">
            Claim your participation and join the creator&apos;s fund distribution.
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] shrink-0"
        >
          Read More
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-7 border-t border-brand-orange/20 pt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-muted-foreground">
        {HIGHLIGHTS.map((h, i) => (
          <span key={h} className="flex items-center gap-2.5">
            {i > 0 && <span className="text-brand-orange/50" aria-hidden>·</span>}
            {h}
          </span>
        ))}
      </div>
    </section>
  );
}
