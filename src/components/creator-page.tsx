"use client";

import { useState } from "react";
import useSWR from "swr";
import { Activity, Image as ImageIcon, LayoutGrid, ShoppingBag } from "lucide-react";
import type { ApiToken } from "@medialane/sdk";
import Link from "./link.js";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { TabsContent } from "./tabs.js";
import { UnderlineTabs, type UnderlineTab } from "./underline-tabs.js";
import { CreatorHeader } from "./creator-header.js";
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
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { isSameAddress } from "../utils/same-address.js";
import { orderUsd } from "../utils/order-usd.js";
import { profileIdentity } from "../utils/profile-identity.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useMedialaneClient } from "../utils/use-medialane-client.js";
import { useUsdPrices } from "../utils/use-usd-prices.js";
import { useTokensByOwner } from "../utils/use-tokens.js";
import { useCollectionsByOwner } from "../utils/use-collections.js";
import { useUserOrders } from "../utils/use-orders.js";
import { useActivitiesByAddress } from "../utils/use-activities.js";
import { useCreatorByUsername } from "../utils/use-profiles.js";

type TabId = "assets" | "collections" | "listings" | "activity";

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";
const isNft = (itemType: string) => itemType === "ERC721" || itemType === "ERC1155";

export interface CreatorPageProps {
  username: string;
  useAssetActions: UsePortfolioAssetActions;
  useMarketActions: () => CollectionMarketActions;
}

export function CreatorPage({ username, useAssetActions, useMarketActions }: CreatorPageProps) {
  const { walletAddress } = useMedialaneApp();
  const client = useMedialaneClient();
  const resolveImage = useImageUrl();
  const prices = useUsdPrices();
  const [activeTab, setActiveTab] = useState<TabId>("assets");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportToken, setReportToken] = useState<ApiToken | null>(null);

  const { creator, isLoading: creatorLoading } = useCreatorByUsername(username);
  const address = creator?.walletAddress ?? null;
  const isOwner = !!address && !!walletAddress && isSameAddress(address, walletAddress);

  const { tokens, meta, isLoading: tokensLoading, mutate: refreshTokens } = useTokensByOwner(address, 1, 20);
  const { collections, isLoading: collectionsLoading } = useCollectionsByOwner(address);
  const { orders, isLoading: ordersLoading } = useUserOrders(activeTab === "listings" ? address : null);
  const { activities, isLoading: activitiesLoading } = useActivitiesByAddress(activeTab === "activity" ? address : null);
  const { data: hidden } = useSWR(address ? `creator-hidden-${address}` : null, () => client.api.creators.isHidden(address!).catch(() => false));
  const actions = useAssetActions({ refresh: () => void refreshTokens() });
  const market = useMarketActions();

  const listings = orders.filter((o) => o.status === "ACTIVE" && isNft(o.offer.itemType));
  const identity = profileIdentity({ username: creator?.username, name: creator?.name, walletAddress: address });

  if (creatorLoading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="px-6 pt-20 pb-6"><CreatorHeader creator={null} image={null} stats={[]} loading /></div>
        <div className={cn("px-6", GRID)}>{Array.from({ length: 8 }).map((_, i) => <TokenCardSkeleton key={i} />)}</div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Creator not found</h1>
        <p className="text-muted-foreground"><span className="tabular-nums">@{username}</span> isn&apos;t a profile yet.</p>
        <Button variant="outline" asChild><Link href="/creators">Browse creators</Link></Button>
      </div>
    );
  }

  const tabs: UnderlineTab[] = [
    { id: "assets", label: "Assets", icon: ImageIcon, count: meta?.total ?? undefined },
    { id: "collections", label: "Collections", icon: LayoutGrid, count: collectionsLoading ? undefined : collections.length },
    { id: "listings", label: "Listings", icon: ShoppingBag, count: activeTab === "listings" && !ordersLoading ? listings.length : undefined },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden pb-20">
      {hidden === true ? <HiddenContentBanner /> : null}

      <div className="px-6 pt-20 pb-6">
        <CreatorHeader
          creator={creator}
          image={resolveImage(creator.avatarImage || tokens[0]?.metadata?.image)}
          stats={[
            { label: "Assets", value: meta?.total ?? null },
            { label: "Collections", value: collectionsLoading ? null : collections.length },
          ]}
        />
      </div>

      <UnderlineTabs
        tabs={tabs}
        value={activeTab}
        onValueChange={(id) => setActiveTab(id as TabId)}
        trailing={address ? <MoreMenu explorerHref={`${EXPLORER_URL}/contract/${address}`} shareTitle={identity.name ?? identity.identity} onReport={() => setReportOpen(true)} /> : null}
      >
        <TabsContent value="assets" className="mt-6 px-6">
          {tokensLoading ? (
            <div className={GRID}>{Array.from({ length: 8 }).map((_, i) => <TokenCardSkeleton key={i} />)}</div>
          ) : tokens.length === 0 ? (
            <TabEmptyState icon={ImageIcon} heading="No assets yet" body="Works this creator makes on Medialane appear here." />
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
          )}
        </TabsContent>

        <TabsContent value="collections" className="mt-6 px-6">
          {collectionsLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CollectionCardSkeleton key={i} />)}</div>
          ) : collections.length === 0 ? (
            <TabEmptyState icon={LayoutGrid} heading="No collections yet" body="Collections this creator makes appear here." />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{collections.map((c) => <CollectionCard key={c.contractAddress} collection={c} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="listings" className="mt-6 px-6">
          {ordersLoading ? (
            <div className={GRID}>{Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>
          ) : listings.length === 0 ? (
            <TabEmptyState icon={ShoppingBag} heading="No active listings" body="Works this creator lists for sale appear here." />
          ) : (
            <div className={GRID}>
              {listings.map((o) => <ListingCard key={o.orderHash} order={o} onBuy={isOwner ? undefined : market.buy} usdValue={orderUsd(o.price, prices)} overflowMenu={<ListingCardMenu order={o} />} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6 max-w-2xl px-6">
          {activitiesLoading ? (
            <div className="space-y-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}</div>
          ) : activities.length === 0 ? (
            <TabEmptyState icon={Activity} heading="No activity yet" body="This creator's activity appears here as it happens." />
          ) : (
            <div>{activities.map((a, i) => <ActivityTimelineRow key={i} event={a} isLast={i === activities.length - 1} />)}</div>
          )}
        </TabsContent>
      </UnderlineTabs>

      {actions.dialogs}
      {market.dialogs}
      {reportToken ? (
        <ReportDialog
          open={!!reportToken}
          onOpenChange={(open) => { if (!open) setReportToken(null); }}
          target={{ type: "TOKEN", contract: reportToken.contractAddress, tokenId: reportToken.tokenId, name: reportToken.metadata?.name ?? undefined }}
        />
      ) : null}
      {address ? (
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} target={{ type: "CREATOR", address, name: identity.name ?? identity.identity }} />
      ) : null}
    </div>
  );
}
