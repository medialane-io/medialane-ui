"use client";

import { ActivityTicker } from "./activity-ticker.js";
import { PageHeader } from "./page-header.js";
import { StatPillRow } from "./stat-tile.js";
import type { ApiOrder } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";

export interface DiscoverHeroProps {
  stats: { collections: number; tokens: number; sales: number } | null;
  orders: ApiOrder[];
  headlineText?: string;
  getTickerHref?: (order: ApiOrder) => string;
}

export function DiscoverHero({
  stats,
  orders,
  headlineText = "Create and explore",
  getTickerHref,
}: DiscoverHeroProps) {
  const t = useT();
  return (
    <div className="space-y-8">
      <PageHeader title={headlineText}>
        {stats && (
          <StatPillRow
            items={[
              { label: t("Collections"), value: stats.collections },
              { label: t("Assets"), value: stats.tokens },
            ]}
          />
        )}
      </PageHeader>
      <ActivityTicker orders={orders} getHref={getTickerHref} />
    </div>
  );
}
