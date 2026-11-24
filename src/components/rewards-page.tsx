"use client";

import { Info } from "lucide-react";
import { PageContainer } from "./page-container.js";
import { RewardsDashboard } from "./rewards/rewards-dashboard.js";
import { useT } from "../i18n/provider.js";

export function RewardsPage() {
  const t = useT();
  return (
    <PageContainer className="space-y-8">
      <RewardsDashboard />

      <footer className="panel px-5 py-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("Point values can change over time.")}
        </p>
      </footer>
    </PageContainer>
  );
}
