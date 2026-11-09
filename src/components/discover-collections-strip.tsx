"use client";

import { Layers } from "lucide-react";
import { ScrollSection } from "./scroll-section.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import type { ApiCollection } from "@medialane/sdk";

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
  title = "Collections",
  icon = <Layers />,
}: DiscoverCollectionsStripProps) {
  return (
    <ScrollSection
      icon={icon}
      title={title}
      href={allCollectionsHref}
      linkLabel="View all"
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
