"use client";

import { PageContainer } from "./page-container.js";
import { useT } from "../i18n/provider.js";

export function AssetUnavailable({ isIndexing }: { isIndexing: boolean }) {
  const t = useT();
  return (
    <PageContainer className="py-24 text-center">
      <p className="text-2xl font-bold">{isIndexing ? t("Preparing this asset") : t("Asset not found")}</p>
      <p className="text-muted-foreground mt-2">
        {isIndexing ? t("It is live onchain and will appear here in a moment.") : t("Check the collection address and token ID.")}
      </p>
    </PageContainer>
  );
}
