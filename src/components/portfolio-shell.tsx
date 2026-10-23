"use client";

import { useEffect, type ReactNode } from "react";
import { Wallet } from "lucide-react";
import { usePathname } from "./router.js";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { PortfolioHeader } from "./portfolio-header.js";
import { PortfolioChipFilter } from "./portfolio-chip-filter.js";
import { useMedialaneApp } from "./medialane-app.js";
import { derivePortfolioCounts } from "../utils/portfolio-counts.js";
import { visiblePortfolioTabs } from "../utils/portfolio-tabs.js";
import { markOffersAsSeen } from "../utils/seen-offers.js";
import { useReceivedOffers, useUserOrders } from "../utils/use-orders.js";
import { useRewards } from "../utils/use-rewards.js";
import { useMySponsorshipDealCounts } from "../utils/use-sponsorship.js";

export interface PortfolioTab {
  key: string;
  label: string;
  href: string;
  hideWhenEmpty?: boolean;
}

export const PORTFOLIO_TABS: PortfolioTab[] = [
  { key: "assets", label: "Assets", href: "/portfolio/assets" },
  { key: "collections", label: "Collections", href: "/portfolio/collections" },
  { key: "listings", label: "Listings", href: "/portfolio/listings", hideWhenEmpty: true },
  { key: "received", label: "Offers received", href: "/portfolio/received", hideWhenEmpty: true },
  { key: "offers", label: "Offers sent", href: "/portfolio/offers", hideWhenEmpty: true },
  { key: "counter", label: "Counter-offers", href: "/portfolio/counter-offers", hideWhenEmpty: true },
  { key: "licensing", label: "Licensing", href: "/portfolio/licensing", hideWhenEmpty: true },
  { key: "sponsorship", label: "Sponsorships", href: "/portfolio/sponsorships", hideWhenEmpty: true },
  { key: "activity", label: "Activity", href: "/portfolio/activity" },
];

function SignedOut() {
  const { onRequireWallet, connectLabel } = useMedialaneApp();
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-24 pb-8 text-center">
      <Wallet className="mx-auto h-10 w-10 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Your portfolio</h1>
      <p className="text-muted-foreground">Sign in to see your assets, listings and offers.</p>
      <Button size="lg" className="rounded-full px-7" onClick={onRequireWallet}>
        {connectLabel ?? "Sign in"}
      </Button>
    </div>
  );
}

function Loading() {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pt-24 pb-8">
      <Skeleton className="mx-auto h-10 w-10 rounded-full" />
      <Skeleton className="mx-auto h-7 w-56" />
      <Skeleton className="mx-auto h-4 w-72" />
    </div>
  );
}

export function PortfolioShell({ tabs = PORTFOLIO_TABS, remixOffers, licensing, children }: {
  tabs?: PortfolioTab[];
  remixOffers?: ReadonlyArray<{ status: string }>;
  licensing?: { present: boolean; isLoading: boolean };
  children: ReactNode;
}) {
  const { walletAddress: address, walletLoading } = useMedialaneApp();
  const pathname = usePathname();
  const { orders, isLoading: ordersLoading } = useUserOrders(address);
  const { orders: receivedOffers, isLoading: receivedLoading } = useReceivedOffers(address);
  const { data: rewards } = useRewards(address);
  const sponsorship = useMySponsorshipDealCounts(address);

  useEffect(() => {
    if (receivedOffers.length > 0) markOffersAsSeen(receivedOffers.map((o) => o.orderHash));
  }, [receivedOffers]);

  if (!address) return walletLoading ? <Loading /> : <SignedOut />;

  const counts = derivePortfolioCounts({ orders, receivedOffers, remixOffers, address, sponsorshipPendingCount: sponsorship.pendingCount });
  const countFor: Record<string, number> = { received: counts.received, counter: counts.counter, licensing: counts.remix, sponsorship: counts.sponsorships };
  const present: Record<string, boolean | undefined> = {
    listings: ordersLoading ? undefined : counts.listings > 0,
    offers: ordersLoading ? undefined : counts.offers > 0,
    counter: ordersLoading ? undefined : counts.counter > 0,
    received: receivedLoading ? undefined : counts.received > 0,
    licensing: licensing ? (licensing.isLoading ? undefined : licensing.present) : true,
    sponsorship: sponsorship.isLoading ? undefined : sponsorship.hasAny,
  };
  const shownTabs = visiblePortfolioTabs(tabs, present, pathname ?? "");

  return (
    <div className="space-y-6 px-4 pt-20 pb-8 sm:px-6 lg:px-8">
      <PortfolioHeader
        address={address}
        score={rewards ? { levelName: rewards.currentLevelName, totalXp: rewards.totalXp, href: "/rewards" } : null}
      />
      <PortfolioChipFilter
        options={shownTabs.map((t) => ({ key: t.key, href: t.href, label: countFor[t.key] ? `${t.label} (${countFor[t.key]})` : t.label }))}
        value={pathname ?? ""}
        onChange={() => {}}
        showAll={false}
      />
      {children}
    </div>
  );
}
