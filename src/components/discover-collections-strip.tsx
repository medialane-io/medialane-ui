"use client";

import { Layers } from "lucide-react";
import { ScrollSection } from "./scroll-section.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import type { ApiCollection } from "@medialane/sdk";

export interface DiscoverCollectionsStripProps {
  collections: ApiCollection[];
  isLoading: boolean;
  /** Kept for API compat — CollectionCard links to /collections/:contract internally */
  getHref?: (collection: ApiCollection) => string;
  allCollectionsHref?: string;
  /** Kept for API compat — the io-style header has no eyebrow label */
  sectionLabel?: string;
  title?: string;
}

/** Discover Collections carousel — CollectionCard tiles under the shared
 *  icon-badge ScrollSection header (io-approved design). */
export function DiscoverCollectionsStrip({
  collections,
  isLoading,
  allCollectionsHref = "/collections",
  title = "Collections",
}: DiscoverCollectionsStripProps) {
  return (
    <ScrollSection
      icon={<Layers className="h-3.5 w-3.5 text-white" />}
      iconBg="bg-gradient-to-br from-brand-blue to-indigo-600 shadow-md shadow-brand-blue/20"
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
