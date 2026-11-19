"use client";

import { useT } from "../i18n/provider.js";
import { Layers } from "lucide-react";
import { ScrollSection } from "./scroll-section.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import type { ApiCollection } from "@medialane/sdk";

import { msg } from "../i18n/translate.js";
export interface DiscoverCollectionsStripProps {
  collections: ApiCollection[];
  isLoading: boolean;

  getHref?: (collection: ApiCollection) => string;
  allCollectionsHref?: string;

  sectionLabel?: string;
  title?: string;
  icon?: React.ReactNode;
}

export function DiscoverCollectionsStrip({
  collections,
  isLoading,
  allCollectionsHref = "/collections",
  title = msg("Collections"),
  icon = <Layers />,
}: DiscoverCollectionsStripProps) {
  const t = useT();
  return (
    <ScrollSection
      icon={icon}
      title={t(title)}
      href={allCollectionsHref}
      linkLabel={msg("View all")}
    >
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-56 sm:w-64 snap-start shrink-0">
              <CollectionCardSkeleton />
            </div>
          ))
        : collections.map((col) => (
            <div key={col.contractAddress} className="w-56 sm:w-64 snap-start shrink-0">
              <CollectionCard collection={col} />
            </div>
          ))}
    </ScrollSection>
  );
}
