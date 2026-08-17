"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CreatorAirdropBannerProps {

  href: string;
}

export function CreatorAirdropBanner({ href }: CreatorAirdropBannerProps) {
  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-brand-orange to-brand-maeve">
      <section className="rounded-[15px] bg-background px-7 py-8 sm:px-9">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-brand-orange to-brand-maeve bg-clip-text text-transparent">
            Creator&apos;s Fund
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-maeve animate-pulse" />
            Live
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground">
              Creator&apos;s Airdrop
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-md">
              Claim your participation and join the creator&apos;s fund distribution.
            </p>
          </div>

          <Link
            href={href}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-brand-maeve px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] shrink-0"
          >
            Read More
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
