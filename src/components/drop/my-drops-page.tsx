"use client";

import { MyDrops } from "./my-drops.js";
import { PageContainer } from "../page-container.js";
import { PageHeader } from "../page-header.js";
import { useT } from "../../i18n/provider.js";

export function MyDropsPage() {
  const t = useT();
  return (
    <PageContainer className="space-y-8">
      <PageHeader title={t("My drops")} />
      <MyDrops />
    </PageContainer>
  );
}
