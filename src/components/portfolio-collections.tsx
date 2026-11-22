"use client";

import type { ReactNode } from "react";
import { Download, Layers } from "lucide-react";
import { useCollectionsByOwner } from "../utils/use-collections.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import { EmptyOrError } from "./empty-or-error.js";
import { useMedialaneApp } from "./medialane-app.js";
import { CollectionTypeChoices, NewCollectionMenu } from "./new-collection-menu.js";
import { useT } from "../i18n/provider.js";

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";

export function PortfolioCollections({ claimPanel }: { claimPanel: ReactNode }) {
  const t = useT();
  const { walletAddress } = useMedialaneApp();
  const { collections, isLoading, error, mutate } = useCollectionsByOwner(walletAddress ?? null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t("Collections")}</h2>
          {collections.length > 0 && (
            <span className="text-sm text-muted-foreground">({collections.length})</span>
          )}
        </div>
        <NewCollectionMenu />
      </div>

      <EmptyOrError
        isLoading={isLoading}
        error={error}
        isEmpty={collections.length === 0}
        onRetry={mutate}
        emptyTitle={t("No collections yet")}
        emptyDescription={t("New collections appear within seconds.")}
        emptyActions={<CollectionTypeChoices />}
        emptyIcon={<Layers className="h-7 w-7 text-muted-foreground" />}
        skeletonNode={
          <div className={GRID}>
            {Array.from({ length: 8 }).map((_, i) => <CollectionCardSkeleton key={i} />)}
          </div>
        }
      >
        <div className={GRID}>
          {collections.map((col) => (
            <CollectionCard
              key={col.contractAddress}
              collection={col}
              settingsHref={`/portfolio/collections/${col.contractAddress}/settings`}
            />
          ))}
        </div>
      </EmptyOrError>

      <div className="pt-6 border-t border-border space-y-4">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{t("Claim a collection")}</h3>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          {t("Link a Starknet collection to your profile.")}
        </p>
        {claimPanel}
      </div>
    </div>
  );
}
