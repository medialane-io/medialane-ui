"use client";

import { Suspense } from "react";
import { DropPage } from "./page/drop-page.js";
import { PageContainer } from "../page-container.js";
import { useSearchParams } from "../router.js";

function DropPageAtTab({ contract }: { contract: string }) {
  const tab = useSearchParams()?.get("tab") ?? undefined;
  return <DropPage contract={contract} initialTab={tab} portfolioHref="/portfolio" />;
}

export function DropDetailPage({ contract }: { contract: string }) {
  return (
    <PageContainer>
      <Suspense fallback={<DropPage contract={contract} portfolioHref="/portfolio" />}>
        <DropPageAtTab contract={contract} />
      </Suspense>
    </PageContainer>
  );
}
