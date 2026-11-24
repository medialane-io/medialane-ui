"use client";

import { SectionHeading } from "./section-heading.js";
import Link from "./link.js";
import { ArrowRight } from "lucide-react";
import { useMedialaneApp } from "./medialane-app.js";
import { LevelJourneyList } from "./rewards/level-journey-list.js";
import { BadgeCatalog } from "./rewards/badge-catalog.js";
import { Skeleton } from "./skeleton.js";
import { useRewardsConfig } from "../utils/use-rewards.js";
import { useT } from "../i18n/provider.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";

const EXAMPLE_ACTION_TYPES = [
  "mint_asset", "buy_asset", "create_collection", "comment",
  "launch_launchpad", "make_offer", "join_club", "list_asset",
];

function Hero() {
  const t = useT();
  return (
    <PageHeader
      title={`${t("Your")} ${t("Journey")}`}
      subtitle={t.rich("Track {link} on Rewards.", {
        link: (
          <Link href="/rewards" className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
            {t("progress")}
          </Link>
        ),
      })}
    />
  );
}

function LevelsSection() {
  const t = useT();
  const { data: config, isLoading } = useRewardsConfig();
  return (
    <section className="py-14 space-y-6">
      <SectionHeading title={t("The level ladder")} subtitle={t("50 levels from Starter to Genesis.")} />
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
      <SectionHeading title={t("How XP works")} subtitle={t("Every action earns XP updated weekly.")} />
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
      <SectionHeading title={t("Badges")} subtitle={t("Every badge to earn.")} />
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
    <PageContainer variant="narrow">
      <Hero />
      <LevelsSection />
      <HowXpWorksSection />
      <BadgesSection />
      <CtaSection startHint={startHint} />
    </PageContainer>
  );
}
