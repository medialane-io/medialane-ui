"use client";

import { DropPage } from "./page/drop-page.js";
import { PageContainer } from "../page-container.js";
import { useSearchParams } from "../router.js";

export function DropDetailPage({ contract }: { contract: string }) {
  const tab = useSearchParams()?.get("tab") ?? undefined;
  return (
    <PageContainer>
      <DropPage contract={contract} initialTab={tab} portfolioHref="/portfolio" />
    </PageContainer>
  );
}
