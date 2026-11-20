"use client";

import { Tag } from "lucide-react";
import { SectionHeading, type SectionHeadingProps } from "./section-heading.js";
import { FadeIn } from "./motion-primitives.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import type { ApiOrder } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";

import { msg } from "../i18n/translate.js";
function StripShell({
  children,
  ...heading
}: SectionHeadingProps & { children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <SectionHeading {...heading} />

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-5 sm:gap-6 snap-x snap-mandatory pb-2" style={{ width: "max-content" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

export interface DiscoverActivityStripProps {
  orders: ApiOrder[];
  isLoading: boolean;
  marketplaceHref?: string;
  onBuyOrder?: (order: ApiOrder) => void;
  isOwnOrder?: (order: ApiOrder) => boolean;
}

export function DiscoverActivityStrip({
  orders,
  isLoading,
  marketplaceHref = "/marketplace",
  onBuyOrder,
  isOwnOrder,
}: DiscoverActivityStripProps) {
  const t = useT();
  return (
    <FadeIn>
      <StripShell
        icon={<Tag className="h-4 w-4" />}
        title={t("Activity")}
        href={marketplaceHref}
        linkLabel={msg("View all")}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-56 sm:w-64 snap-start shrink-0">
                <ListingCardSkeleton />
              </div>
            ))
          : orders.length === 0
          ? (
              <p className="text-sm text-muted-foreground py-4">{t("No active listings yet.")}</p>
            )
          : orders.map((order) => {
              const own = isOwnOrder?.(order) ?? false;
              return (
                <div key={order.orderHash} className="w-56 sm:w-64 snap-start shrink-0">
                  <ListingCard
                    order={order}
                    onBuy={onBuyOrder && !own ? () => onBuyOrder(order) : undefined}
                  />
                </div>
              );
            })}
      </StripShell>
    </FadeIn>
  );
}
