"use client";

import Link from "./link.js";
import { Sparkles, ArrowRight } from "lucide-react";
import { useMedialaneApp } from "./medialane-app.js";
import { LevelJourneyList } from "./rewards/level-journey-list.js";
import { BadgeCatalog } from "./rewards/badge-catalog.js";
import { Skeleton } from "./skeleton.js";
import { useRewardsConfig } from "../utils/use-rewards.js";
import { useT } from "../i18n/provider.js";
import { IconTile } from "./icon-tile.js";

const EXAMPLE_ACTION_TYPES = [
  "mint_asset", "buy_asset", "create_collection", "comment",
  "launch_launchpad", "make_offer", "join_club", "list_asset",
];

function Hero() {
  const t = useT();
  return (
    <section className="py-14 space-y-5">
      <div className="flex items-center gap-3">
        <IconTile>
          <Sparkles />
        </IconTile>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.02]">
          {t("Your")}{" "}
          <span className="text-brand-orange">
            {t("Journey")}
          </span>
        </h1>
      </div>
      <p className="text-lg text-foreground/70 max-w-xl leading-relaxed font-medium">{t.rich("Every level, every badge, every way to earn — the whole system, in one place. Check {link} on Rewards.", { link: <Link href="/rewards" className="text-foreground underline underline-offset-2 hover:text-brand-orange transition-colors">
          {t("your own score")}
        </Link> })}</p>
    </section>
  );
}

function LevelsSection() {
  const t = useT();
  const { data: config, isLoading } = useRewardsConfig();
  return (
    <section className="py-14 space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">{t("The level ladder")}</h2>
        <p className="text-base text-foreground/60 mt-1.5 font-medium">{t("50 levels, from Starter to Genesis.")}</p>
      </div>
      {isLoading || !config ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : (
        <LevelJourneyList levels={config.levels} />
      )}
    </section>
  );
}

function HowXpWorksSection() {
  const t = useT();
  const { data: config, isLoading } = useRewardsConfig();
  const examples = config?.actions.filter((a) => EXAMPLE_ACTION_TYPES.includes(a.type)) ?? [];

  return (
    <section className="py-14 space-y-6">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-black tracking-tight">{t("How XP works")}</h2>
        <p className="text-base text-foreground/60 mt-1.5 font-medium leading-relaxed">
          {t("Every action earns real XP, automatically — no buying points, no gaming the system. Some early actions and loyalty count extra. Scores and badges are recalculated weekly.")}
        </p>
      </div>
      {isLoading || !config ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {examples.map((a) => (
            <div key={a.type} className="rounded-2xl bg-foreground/[0.04] p-4">
              <p className="text-lg font-black text-brand-orange">+{a.xp}</p>
              <p className="text-xs font-semibold text-foreground/60 mt-1 leading-snug">{a.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function BadgesSection() {
  const t = useT();
  const { data: config, isLoading } = useRewardsConfig();
  return (
    <section className="py-14 space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight">{t("Badges")}</h2>
        <p className="text-base text-foreground/60 mt-1.5 font-medium">{t("What's achievable, not just what you've done.")}</p>
      </div>
      {isLoading || !config ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <BadgeCatalog badges={config.badges} />
      )}
    </section>
  );
}

function CtaSection({ startHint }: { startHint: string }) {
  const t = useT();
  const { onRequireWallet } = useMedialaneApp();
  return (
    <section className="py-14 pb-20 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onRequireWallet}
        className="flex items-center justify-between rounded-2xl bg-brand-orange p-6 text-left text-white"
      >
        <div>
          <p className="font-black text-lg">{t("New here?")}</p>
          <p className="text-sm font-medium text-white/80">{t(startHint)}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0" />
      </button>
      <Link
        href="/rewards"
        className="flex items-center justify-between rounded-2xl bg-foreground/[0.04] hover:bg-foreground/[0.07] p-6 transition-colors"
      >
        <div>
          <p className="font-black text-lg">{t("Already earning?")}</p>
          <p className="text-sm font-medium text-foreground/60">{t("Check your score.")}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0" />
      </Link>
    </section>
  );
}

export function JourneyContent({ startHint }: { startHint: string }) {
  return (
    <>
      <Hero />
      <LevelsSection />
      <HowXpWorksSection />
      <BadgesSection />
      <CtaSection startHint={startHint} />
    </>
  );
}
