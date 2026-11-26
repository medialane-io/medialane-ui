"use client";

import { Package } from "lucide-react";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { DropFeatures } from "./drop/drop-features.js";
import { DropListing } from "./drop/drop-listing.js";
import { FadeIn } from "./motion-primitives.js";
import { BackButton } from "./back-button.js";
import { useT } from "../i18n/provider.js";

export function DropsPage() {
  const t = useT();
  return (
    <PageContainer variant="narrow" className="space-y-8">

      <PageHeader
        back={<BackButton />}
        icon={<Package />}
        title={t("NFT Drops")}
        subtitle={t("Timed releases with a fixed supply.")}
      />

      <section>
        <FadeIn>
          <DropFeatures />
        </FadeIn>
      </section>

      <section>
        <DropListing />
      </section>

    </PageContainer>
  );
}
