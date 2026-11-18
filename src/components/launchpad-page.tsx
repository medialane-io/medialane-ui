"use client";

import { useMemo, type ReactNode } from "react";
import { getService } from "@medialane/sdk";
import { FadeIn } from "./motion-primitives.js";
import { LaunchpadGroupedSections, LAUNCHPAD_ROUTE_OVERRIDES, selectLaunchpadServices, useLaunchpadFilter, type ServiceOverrides } from "./launchpad-services.js";
import { LAUNCHPAD_SERVICE_GROUPS } from "../data/launchpad-services.js";
import { LaunchpadFilterBar } from "./launchpad-filter-bar.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useCollectionsByOwner } from "../utils/use-collections.js";
import { useT } from "../i18n/provider.js";

export interface LaunchpadPageProps {
  fastMint: ReactNode;
  hideGroups?: string[];
  excludeKeys?: string[];
}

export function LaunchpadPage({ fastMint, hideGroups = [], excludeKeys }: LaunchpadPageProps) {
  const t = useT();
  const { walletAddress } = useMedialaneApp();
  const filter = useLaunchpadFilter();
  const { collections } = useCollectionsByOwner(walletAddress);

  const overrides = useMemo<ServiceOverrides>(() => {
    const nftCount = collections.filter((c) => getService(c.service)?.id === "mip-erc721").length;
    const editionsCount = collections.filter((c) => c.standard === "ERC1155").length;
    const withMeta = (key: string, count: number): ServiceOverrides =>
      count > 0 ? { [key]: { ...LAUNCHPAD_ROUTE_OVERRIDES[key], meta: `${count} collection${count === 1 ? "" : "s"}` } } : {};
    return { ...LAUNCHPAD_ROUTE_OVERRIDES, ...withMeta("nfts", nftCount), ...withMeta("limited-editions", editionsCount) };
  }, [collections]);

  const defs = useMemo(
    () => selectLaunchpadServices({ query: filter.query, hideGroups, excludeKeys }),
    [filter.query, hideGroups, excludeKeys],
  );

  const sections = LAUNCHPAD_SERVICE_GROUPS
    .filter((g) => g.key !== "coming-soon")
    .map((group) => ({ group, count: defs.filter((d) => d.group === group.key).length }))
    .filter((s) => s.count > 0);

  return (
    <div className="relative pb-20 space-y-16 sm:space-y-24">
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 space-y-6">
        <FadeIn>
          <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">{t("Creator Launchpad")}</h1>
        </FadeIn>
        <FadeIn delay={0.06}>{fastMint}</FadeIn>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <FadeIn delay={0.06}>
          <LaunchpadFilterBar query={filter.query} onQueryChange={filter.setQuery} sections={sections} />
        </FadeIn>
        <LaunchpadGroupedSections overrides={overrides} defs={defs} onClearFilters={filter.clear} />
      </section>
    </div>
  );
}
