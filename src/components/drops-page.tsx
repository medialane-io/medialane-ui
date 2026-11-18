"use client";

import { Package } from "lucide-react";
import { ServiceHeader } from "./service-header.js";
import { DropFeatures } from "./drop/drop-features.js";
import { DropListing } from "./drop/drop-listing.js";
import { FadeIn } from "./motion-primitives.js";
import { BackButton } from "./back-button.js";
import { useT } from "../i18n/provider.js";

export function DropsPage() {
  const t = useT();
  return (
    <div className="pb-16 space-y-10">

      <section className="px-4 pt-10 max-w-5xl mx-auto">
        <BackButton />
        <FadeIn>
          <div className="mt-6">
            <ServiceHeader
              plain
              icon={<Package className="h-4 w-4 text-white" />}
              title={t("Drops")}
              subtitle={t("Timed releases with a fixed supply. Browse live drops to collect, or launch your own.")}
            />
          </div>
        </FadeIn>
      </section>

      <section className="px-4 max-w-5xl mx-auto">
        <FadeIn>
          <DropFeatures />
        </FadeIn>
      </section>

      <section className="px-4 max-w-5xl mx-auto">
        <DropListing />
      </section>

    </div>
  );
}
