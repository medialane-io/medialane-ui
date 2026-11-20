"use client";

import Link from "./link.js";
import { ArrowRight, Zap, Coins, Gift } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";
import { IconTile } from "./icon-tile.js";

export interface RewardsSectionProps {
  rewardsHref: string;
}

const pillars = [
  {
    icon: Zap,
    label: "XP",
    detail: msg("Earned for every mint, trade, and connection you make."),
  },
  {
    icon: Coins,
    label: msg("Creator's Fund"),
    detail: msg("Your XP grows your share of the shared pool."),
  },
  {
    icon: Gift,
    label: msg("Airdrop"),
    detail: msg("Claim your share on-chain, every round."),
  },
];

export function RewardsSection({ rewardsHref }: RewardsSectionProps) {
  const t = useT();
  return (
    <section className="panel px-7 py-8 sm:px-9">
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-14">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground">
            {t("Rewards")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">
            {t("Every action earns XP. Active members receive a growing share of the Creator's Fund, claimed as an airdrop each round.")}
          </p>

          <Link
            href={rewardsHref}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t("View your rewards")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:w-[300px] shrink-0 lg:border-l lg:border-border lg:pl-10">
          {pillars.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex items-start gap-3.5">
              <IconTile size="sm">
                <Icon />
              </IconTile>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{t(label)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(detail)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
