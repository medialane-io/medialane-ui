"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CreatorAirdropBannerProps {

  href: string;
}

export function CreatorAirdropBanner({ href }: CreatorAirdropBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand-orange px-7 py-8 sm:px-9">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-orange to-brand-maeve" />

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-white">
          Creator&apos;s Fund
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-white">
            Creator&apos;s Airdrop
          </h2>
          <p className="mt-1.5 text-sm text-white/75 leading-relaxed max-w-md">
            Claim your participation and join the creator&apos;s fund distribution.
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-orange transition-all hover:brightness-95 active:scale-[0.98] shrink-0"
        >
          Read More
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
