"use client";

import { useState } from "react";
import useSWR from "swr";
import { Activity, Image as ImageIcon, LayoutGrid, ShoppingBag } from "lucide-react";
import type { ApiToken } from "@medialane/sdk";
import { Skeleton } from "./skeleton.js";
import { AddressDisplay } from "./address-display.js";
import { HiddenContentBanner } from "./hidden-content-banner.js";
import { TabEmptyState } from "./tab-empty-state.js";
import { TokenCard, TokenCardSkeleton } from "./token-card.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ListingCardMenu } from "./listing-card-menu.js";
import { ActivityTimelineRow } from "./activity-timeline-row.js";
import { MoreMenu } from "./more-menu.js";
import { useMedialaneApp } from "./medialane-app.js";
import { ReportDialog } from "./report-dialog.js";
import type { UsePortfolioAssetActions } from "./portfolio-assets.js";
import type { CollectionMarketActions } from "./collection-page.js";
import { cn } from "../utils/cn.js";
import { shortenAddress } from "../utils/address.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { isSameAddress } from "../utils/same-address.js";
import { orderUsd } from "../utils/order-usd.js";
import { useMedialaneClient } from "../utils/use-medialane-client.js";
import { useUsdPrices } from "../utils/use-usd-prices.js";
import { useTokensByOwner } from "../utils/use-tokens.js";
import { useCollectionsByOwner } from "../utils/use-collections.js";
import { useUserOrders } from "../utils/use-orders.js";
import { useActivitiesByAddress } from "../utils/use-activities.js";

const TABS = [
  { id: "assets", label: "Assets", Icon: ImageIcon },
  { id: "collections", label: "Collections", Icon: LayoutGrid },
  { id: "listings", label: "Listings", Icon: ShoppingBag },
  { id: "activity", label: "Activity", Icon: Activity },
] as const;

type TabId = (typeof TABS)[number]["id"];

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
const isNft = (itemType: string) => itemType === "ERC721" || itemType === "ERC1155";

export interface AccountPageProps {
  address: string;
  useAssetActions: UsePortfolioAssetActions;
  useMarketActions: () => CollectionMarketActions;
}

export function AccountPage({ address, useAssetActions, useMarketActions }: AccountPageProps) {
  const { walletAddress } = useMedialaneApp();
  const client = useMedialaneClient();
  const prices = useUsdPrices();
  const [activeTab, setActiveTab] = useState<TabId>("assets");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportToken, setReportToken] = useState<ApiToken | null>(null);

  const isOwner = !!walletAddress && isSameAddress(address, walletAddress);

  const { tokens, meta, isLoading: tokensLoading, mutate: refreshTokens } = useTokensByOwner(address, 1, 20);
  const { collections, isLoading: collectionsLoading } = useCollectionsByOwner(address);
  const { orders, isLoading: ordersLoading } = useUserOrders(address);
  const { activities, isLoading: activitiesLoading } = useActivitiesByAddress(activeTab === "activity" ? address : null);
  const { data: hidden } = useSWR(`creator-hidden-${address}`, () => client.api.creators.isHidden(address).catch(() => false));
  const actions = useAssetActions({ refresh: () => void refreshTokens() });
  const market = useMarketActions();

  const listings = orders.filter((o) => o.status === "ACTIVE" && isNft(o.offer.itemType));
  const counts: Partial<Record<TabId, number>> = {
    assets: meta?.total ?? undefined,
    collections: collectionsLoading ? undefined : collections.length,
    listings: ordersLoading ? undefined : listings.length,
  };

  return (
    <div className="min-h-screen overflow-x-hidden pb-20">
      {hidden === true ? <HiddenContentBanner /> : null}

      <div className="space-y-2 px-6 pt-20 pb-6">
        <AddressDisplay address={address} chars={10} className="text-2xl font-black tracking-tight tabular-nums sm:text-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
          Starknet
        </span>
      </div>

      <div className="sticky top-0 z-20 mt-4 flex items-center gap-2 bg-background/95 px-6 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, Icon }) => {
            const count = counts[id];
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors duration-200",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count ? (
                  <span className={cn("min-w-[18px] rounded-full px-1.5 py-px text-center text-2xs font-bold tabular-nums", active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{count}</span>
                ) : null}
                {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" /> : null}
              </button>
            );
          })}
        </div>
        <MoreMenu explorerHref={`${EXPLORER_URL}/contract/${address}`} shareTitle={shortenAddress(address)} onReport={() => setReportOpen(true)} />
      </div>

      <div className="mt-6 px-6">
        {activeTab === "assets" && (
          tokensLoading ? (
            <div className={GRID}>{Array.from({ length: 8 }).map((_, i) => <TokenCardSkeleton key={i} />)}</div>
          ) : tokens.length === 0 ? (
            <TabEmptyState icon={ImageIcon} heading="No assets yet" body="Works this account owns appear here." />
          ) : (
            <div className={GRID}>
              {tokens.map((t: ApiToken) => {
                const listing = t.activeOrders?.find((o) => isNft(o.offer.itemType));
                return (
                  <TokenCard
                    key={`${t.contractAddress}-${t.tokenId}`}
                    token={t}
                    isOwner={isOwner}
                    usdValue={orderUsd(listing?.price, prices)}
                    onList={isOwner ? actions.list : undefined}
                    onTransfer={isOwner ? actions.transfer : undefined}
                    onCancel={isOwner ? actions.cancel : undefined}
                    onBuy={!isOwner && listing ? () => market.buy(listing) : undefined}
                    onOffer={isOwner ? undefined : market.offer}
                    onReport={setReportToken}
                  />
                );
              })}
            </div>
          )
        )}

        {activeTab === "collections" && (
          collectionsLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CollectionCardSkeleton key={i} />)}</div>
          ) : collections.length === 0 ? (
            <TabEmptyState icon={LayoutGrid} heading="No collections yet" body="Collections this account owns appear here." />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{collections.map((c) => <CollectionCard key={c.contractAddress} collection={c} />)}</div>
          )
        )}

        {activeTab === "listings" && (
          ordersLoading ? (
            <div className={GRID}>{Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>
          ) : listings.length === 0 ? (
            <TabEmptyState icon={ShoppingBag} heading="No active listings" body="Works this account lists for sale appear here." />
          ) : (
            <div className={GRID}>
              {listings.map((o) => <ListingCard key={o.orderHash} order={o} onBuy={isOwner ? undefined : market.buy} usdValue={orderUsd(o.price, prices)} overflowMenu={<ListingCardMenu order={o} />} />)}
            </div>
          )
        )}

        {activeTab === "activity" && (
          <div className="max-w-2xl">
            {activitiesLoading ? (
              <div className="space-y-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}</div>
            ) : activities.length === 0 ? (
              <TabEmptyState icon={Activity} heading="No activity yet" body="This account's activity appears here as it happens." />
            ) : (
              <div>{activities.map((a, i) => <ActivityTimelineRow key={i} event={a} isLast={i === activities.length - 1} />)}</div>
            )}
          </div>
        )}
      </div>

      {actions.dialogs}
      {market.dialogs}
      {reportToken ? (
        <ReportDialog
          open={!!reportToken}
          onOpenChange={(open) => { if (!open) setReportToken(null); }}
          target={{ type: "TOKEN", contract: reportToken.contractAddress, tokenId: reportToken.tokenId, name: reportToken.metadata?.name ?? undefined }}
        />
      ) : null}
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} target={{ type: "CREATOR", address, name: shortenAddress(address) }} />
    </div>
  );
}
