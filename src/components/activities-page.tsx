"use client";

import { ActivitiesFeed } from "./activities-feed.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { useT } from "../i18n/provider.js";

export function ActivitiesPage() {
  const t = useT();
  return (
    <PageContainer className="space-y-8">
      <PageHeader title={t("Onchain Activity")} />
      <ActivitiesFeed />
    </PageContainer>
  );
}
