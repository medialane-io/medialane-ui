"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { Inbox, Lock, Sparkles, Ticket } from "lucide-react";
import { assetHref, getService, type ApiCollection, type ApiOrder, type ApiToken, type Chain, type CollectionTokensSort } from "@medialane/sdk";
import Link from "./link.js";
import { AssetCard, AssetCardSkeleton } from "./asset-card.js";
import { CollectionHeader } from "./collection-header.js";
import { CollectionFiltersDialog, CollectionActiveFilters } from "./collection-filters-dialog.js";
import { CollectionMoreMenu } from "./collection-more-menu.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { CollectionActivityTab } from "./collection-activity-tab.js";
import { CollectionTraitsTab } from "./collection-traits-tab.js";
import { ClubOwnerActions } from "./club-owner-actions.js";
import { OwnerSetupPanel } from "./owner-setup-panel.js";
import { HiddenContentBanner } from "./hidden-content-banner.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ListingCardMenu } from "./listing-card-menu.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { MakeOfferPicker } from "./make-offer-picker.js";
import { OrderSortControl, sortOrders, type OrderSort } from "./order-sort-control.js";
import { GatedContentHero, GatedContentPanel, type GatedContentState } from "./gated-content.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useCollection, useCollectionTokens } from "../utils/use-collections.js";
import { useOrders } from "../utils/use-orders.js";
import { useCollectionProfile } from "../utils/use-profiles.js";
import { useUsdPrices, usdPriceFor } from "../utils/use-usd-prices.js";
import { formatUsd } from "../utils/format.js";
import { isSameAddress } from "../utils/same-address.js";
import { isLivingRenderCollection } from "../data/living-render-collections.js";

export interface CollectionMarketActions {
  buy: (order: ApiOrder) => void;
  offer: (token: ApiToken) => void;
  dialogs: ReactNode;
}

export interface CollectionPageSlots {
  useMarketActions: () => CollectionMarketActions;
  useGatedContent: (contract: string | undefined) => GatedContentState;
  ServiceAction: ComponentType<{ service: string | null | undefined; contractAddress: string }>;
  TransferOwnership: ComponentType<{ collectionId: string; currentOwner: string; collectionName: string | null }>;
}

const PAGE_SIZE = 24;
const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4";

const MINT_HREFS: Partial<Record<string, (contract: string) => string>> = {
  "mip-erc721": () => "/launchpad/single-editions",
  "mip-erc1155": (c) => `/launchpad/nfteditions/${c}/mint`,
  "ip-tickets": (c) => `/launchpad/tickets/${c}/mint`,
  "ip-club": (c) => `/launchpad/club/${c}/mint`,
};

/** Ownership transfer exists from the audited v3 collection registry (2026-05-14) on. */
export function canTransferCollectionOwnership(collection: ApiCollection): boolean {
  return !!collection.collectionId && collection.standard === "ERC721" && collection.createdAt >= "2026-05-14";
}

function usdFor(order: ApiOrder | undefined, prices: ReturnType<typeof useUsdPrices>): string | null {
  const currency = order?.price?.currency?.toUpperCase();
  const amount = order?.price?.formatted ? parseFloat(order.price.formatted) : NaN;
  const rate = currency ? usdPriceFor(prices, currency) : undefined;
  return rate == null || isNaN(amount) ? null : formatUsd(amount * rate);
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="py-20 flex flex-col items-center gap-3 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground/70 max-w-xs">{body}</p>
      {action ? (
        <Link href={action.href} className="mt-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-90 transition">
          <Sparkles className="h-3.5 w-3.5" />
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function useCollectionItems(contract: string) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<CollectionTokensSort>("recent");
  const [allTokens, setAllTokens] = useState<ApiToken[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const { tokens, meta, isLoading } = useCollectionTokens(contract, page, PAGE_SIZE, sort);

  const handleSortChange = (next: CollectionTokensSort) => {
    setSort(next);
    setPage(1);
    setAllTokens([]);
  };

  useEffect(() => {
    if (tokens.length === 0) return;
    setAllTokens((prev) => {
      const ids = new Set(prev.map((t) => `${t.contractAddress}-${t.tokenId}`));
      return page === 1 ? tokens : [...prev, ...tokens.filter((t) => !ids.has(`${t.contractAddress}-${t.tokenId}`))];
    });
  }, [tokens, page]);

  return { meta, isLoading, setPage, sort, handleSortChange, allTokens, selectedFilters, setSelectedFilters };
}

type CollectionItemsState = ReturnType<typeof useCollectionItems>;

function CollectionItems({ items, activeListings, mintHref }: { items: CollectionItemsState; activeListings: ApiOrder[]; mintHref: string | null }) {
  const { meta, isLoading, setPage, sort, handleSortChange, allTokens, selectedFilters, setSelectedFilters } = items;
  const usdPrices = useUsdPrices();

  const listingByTokenId = useMemo(() => new Map(activeListings.filter((o) => o.nftTokenId).map((o) => [o.nftTokenId!, o])), [activeListings]);

  const visibleTokens = useMemo(() => {
    const filters = Object.entries(selectedFilters);
    return allTokens.filter((token) => {
      if (filters.length === 0) return true;
      const attrs = Array.isArray(token.metadata?.attributes) ? (token.metadata.attributes as { trait_type?: string; value?: string }[]) : [];
      return filters.every(([traitType, values]) => attrs.some((a) => a.trait_type === traitType && values.includes(String(a.value))));
    });
  }, [allTokens, selectedFilters]);

  if (isLoading && allTokens.length === 0) {
    return <div className={GRID}>{Array.from({ length: 8 }).map((_, i) => <AssetCardSkeleton key={i} />)}</div>;
  }

  if (allTokens.length === 0) {
    return mintHref ? (
      <EmptyState title="Ready for your first work" body="Mint into this collection and it appears here." action={{ href: mintHref, label: "Mint your first work" }} />
    ) : (
      <EmptyState title="No items yet" body="Tokens in this collection will appear here once indexed." />
    );
  }

  return (
    <div className="space-y-3">
      <CollectionActiveFilters tokens={allTokens} selected={selectedFilters} onChange={setSelectedFilters} sort={sort} onSortChange={handleSortChange} />
      {visibleTokens.length === 0 ? (
        <EmptyState title="No items match these filters" body="Try removing some filters to see more results." />
      ) : (
        <div className={GRID}>
          {visibleTokens.map((t) => {
            const listing =
              t.activeOrders?.find((o) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155") ?? listingByTokenId.get(t.tokenId);
            return (
              <AssetCard
                key={`${t.contractAddress}-${t.tokenId}`}
                href={assetHref(t.chain as Chain, t.contractAddress, t.tokenId)}
                name={t.metadata?.name || `Token #${t.tokenId}`}
                image={t.metadata?.image}
                animationUrl={t.metadata?.animationUrl}
                live={isLivingRenderCollection(t.chain as Chain, t.contractAddress)}
                ipType={t.metadata?.ipType}
                price={listing ? { ...listing.price, usdValue: usdFor(listing, usdPrices) } : null}
                fallbackId={t.tokenId}
                indexing={t.metadataStatus === "PENDING" || t.metadataStatus === "FETCHING"}
              />
            );
          })}
        </div>
      )}
      <LoadMoreSentinel hasMore={meta ? allTokens.length < (meta.total ?? 0) : false} isLoading={isLoading} onLoadMore={() => setPage((p) => p + 1)} />
    </div>
  );
}

function OwnerActions({ collection }: { collection: ApiCollection }) {
  const service = getService(collection.service)?.id;
  const contract = collection.contractAddress;
  if (service === "ip-tickets") {
    return (
      <Link href={`/launchpad/tickets/${contract}/mint`} className="flex w-fit items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white bg-brand-blue hover:brightness-110 active:scale-[0.98] transition">
        <Ticket className="h-3.5 w-3.5" />
        Mint tickets
      </Link>
    );
  }
  if (service === "ip-club") return <ClubOwnerActions contractAddress={contract} isOwner />;
  return null;
}

export interface CollectionPageProps {
  contract: string;
  slots: CollectionPageSlots;
}

export function CollectionPage({ contract, slots }: CollectionPageProps) {
  const { walletAddress, ReportDialog } = useMedialaneApp();
  const { collection, isLoading: collectionLoading } = useCollection(contract);
  const { profile } = useCollectionProfile(contract);
  const gatedState = slots.useGatedContent(profile?.hasGatedContent ? contract : undefined);
  const market = slots.useMarketActions();
  const { orders, isLoading: ordersLoading } = useOrders({ collection: contract, status: "ACTIVE", sort: "recent", limit: 100 });

  const [reportOpen, setReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("assets");
  const [marketTab, setMarketTab] = useState<"listings" | "offers">("listings");
  const [provenanceTab, setProvenanceTab] = useState<"activity" | "traits">("activity");
  const [listingsSort, setListingsSort] = useState<OrderSort>("recent");
  const [offersSort, setOffersSort] = useState<OrderSort>("recent");
  const usdPrices = useUsdPrices();
  const items = useCollectionItems(contract);

  const activeListings = orders.filter((o) => o.status === "ACTIVE" && (o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155"));
  const activeBids = orders.filter((o) => o.status === "ACTIVE" && o.offer.itemType === "ERC20");
  const isOwner = !!collection?.owner && !!walletAddress && isSameAddress(collection.owner, walletAddress);
  const mintHref = isOwner && collection ? MINT_HREFS[getService(collection.service)?.id ?? ""]?.(contract) ?? null : null;
  const { ServiceAction, TransferOwnership } = slots;

  const listingGrid = (items: ApiOrder[], sort: OrderSort, buyable: boolean) => (
    <div className={GRID}>
      {sortOrders(items, sort).map((o) => (
        <ListingCard
          key={o.orderHash}
          order={o}
          onBuy={buyable && !isSameAddress(o.offerer, walletAddress) ? market.buy : undefined}
          usdValue={usdFor(o, usdPrices)}
          overflowMenu={<ListingCardMenu order={o} />}
        />
      ))}
    </div>
  );
  const loadingGrid = <div className={GRID}>{Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>;

  return (
    <div className="relative z-0 min-h-screen">
      {(collection as { isHidden?: boolean } | null | undefined)?.isHidden ? <HiddenContentBanner /> : null}

      <div className="px-4 sm:px-6 pt-20 pb-6 space-y-4">
        <CollectionHeader collection={collection} loading={collectionLoading}>
          {collection && isOwner ? <OwnerActions collection={collection} /> : null}
          {collection ? <ServiceAction service={collection.service} contractAddress={collection.contractAddress} /> : null}
        </CollectionHeader>
        {collection && profile ? <GatedContentHero profile={profile} state={gatedState} onViewExclusive={() => setActiveTab("exclusive")} /> : null}
      </div>

      <div className="px-4 sm:px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="sticky top-0 z-10 flex items-center gap-2 pt-3 pb-1">
            <TabsList className="min-w-0 flex-1 overflow-x-auto sm:flex-none">
              <TabsTrigger value="assets" className="flex-1 sm:flex-none">
                Assets{collection?.totalSupply ? ` (${collection.totalSupply.toLocaleString()})` : ""}
              </TabsTrigger>
              <TabsTrigger value="market" className="flex-1 sm:flex-none">
                Market{!ordersLoading && activeListings.length + activeBids.length > 0 && ` (${activeListings.length + activeBids.length})`}
              </TabsTrigger>
              <TabsTrigger value="provenance" className="flex-1 sm:flex-none">Provenance</TabsTrigger>
              {profile?.hasGatedContent ? (
                <TabsTrigger value="exclusive" className="flex-1 sm:flex-none gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Exclusive
                </TabsTrigger>
              ) : null}
            </TabsList>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {activeTab === "assets" && items.allTokens.length > 0 ? (
                <CollectionFiltersDialog tokens={items.allTokens} selected={items.selectedFilters} onChange={items.setSelectedFilters} sort={items.sort} onSortChange={items.handleSortChange} chips={false} />
              ) : null}
              {collection ? (
                <CollectionMoreMenu
                  explorerHref={`${EXPLORER_URL}/contract/${collection.contractAddress}`}
                  shareTitle={collection.name ?? "Collection"}
                  onReport={() => setReportOpen(true)}
                />
              ) : null}
            </div>
          </div>

          <TabsContent value="assets" className="mt-4">
            {collection ? <CollectionItems items={items} activeListings={activeListings} mintHref={mintHref} /> : null}
          </TabsContent>

          <TabsContent value="market" className="mt-4">
            <Tabs value={marketTab} onValueChange={(v) => setMarketTab(v as "listings" | "offers")}>
              <TabsList className="h-9">
                <TabsTrigger value="listings" className="text-xs px-3 py-1">
                  Listings{!ordersLoading && activeListings.length > 0 && ` (${activeListings.length})`}
                </TabsTrigger>
                <TabsTrigger value="offers" className="text-xs px-3 py-1">
                  Offers{!ordersLoading && activeBids.length > 0 && ` (${activeBids.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-4">
                {ordersLoading ? loadingGrid : activeListings.length === 0 ? (
                  <EmptyState title="No active listings" body="When items in this collection are listed for sale, they'll appear here." />
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <OrderSortControl value={listingsSort} onChange={setListingsSort} />
                    </div>
                    {listingGrid(activeListings, listingsSort, true)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offers" className="mt-4">
                <div className="flex justify-end items-center gap-2 mb-3">
                  {!ordersLoading && activeBids.length > 0 ? <OrderSortControl value={offersSort} onChange={setOffersSort} /> : null}
                  <MakeOfferPicker contract={contract} onPick={market.offer} />
                </div>
                {ordersLoading ? loadingGrid : activeBids.length === 0 ? (
                  <EmptyState title="No active offers" body="Make the first offer, or check back when collectors start bidding." />
                ) : (
                  listingGrid(activeBids, offersSort, false)
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="provenance" className="mt-4">
            {collection?.standard && (collection.totalSupply ?? 0) > 1 ? (
              <Tabs value={provenanceTab} onValueChange={(v) => setProvenanceTab(v as "activity" | "traits")}>
                <TabsList className="h-9">
                  <TabsTrigger value="activity" className="text-xs px-3 py-1">Activity</TabsTrigger>
                  <TabsTrigger value="traits" className="text-xs px-3 py-1">Traits</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-4">
                  <CollectionActivityTab contract={contract} />
                </TabsContent>
                <TabsContent value="traits" className="mt-4">
                  <CollectionTraitsTab contract={contract} />
                </TabsContent>
              </Tabs>
            ) : (
              <CollectionActivityTab contract={contract} />
            )}
          </TabsContent>

          {profile?.hasGatedContent ? (
            <TabsContent value="exclusive" className="mt-4">
              <GatedContentPanel state={gatedState} onBrowseListings={() => { setMarketTab("listings"); setActiveTab("market"); }} />
            </TabsContent>
          ) : null}
        </Tabs>
      </div>

      {collection && isOwner ? (
        <div className="px-4 sm:px-6 pb-8 space-y-4">
          <OwnerSetupPanel contract={contract} profile={profile ?? null} />
          {canTransferCollectionOwnership(collection) ? (
            <div className="flex justify-end">
              <TransferOwnership collectionId={collection.collectionId!} currentOwner={collection.owner!} collectionName={collection.name} />
            </div>
          ) : null}
        </div>
      ) : null}

      {collection && ReportDialog ? (
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} target={{ type: "COLLECTION", contract: collection.contractAddress, name: collection.name ?? undefined }} />
      ) : null}
      {market.dialogs}
    </div>
  );
}
