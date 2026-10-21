"use client";

import { assetHref, collectionHref, type ApiCollection } from "@medialane/sdk";
import { Tag, TrendingUp } from "lucide-react";
import Link from "./link.js";
import { PageContainer } from "./page-container.js";
import { HeroSlider } from "./hero-slider.js";
import { ActivityTicker } from "./activity-ticker.js";
import { ScrollSection } from "./scroll-section.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ListingCardMenu } from "./listing-card-menu.js";
import { CollectionCard, CollectionCardSkeleton } from "./collection-card.js";
import { RewardsSection } from "./rewards-section.js";
import { LaunchpadStrip } from "./launchpad-strip.js";
import { useMedialaneApp } from "./medialane-app.js";
import type { CollectionMarketActions } from "./collection-page.js";
import { useOrders } from "../utils/use-orders.js";
import { useCollections } from "../utils/use-collections.js";
import { useUsdPrices } from "../utils/use-usd-prices.js";
import { orderUsd } from "../utils/order-usd.js";
import { isSameAddress } from "../utils/same-address.js";

const LAUNCHPAD_HREFS = {
  nfts: "/launchpad/single-editions",
  "limited-editions": "/launchpad/nfteditions",
  "collection-drop": "/launchpad/drop",
  "pop-protocol": "/launchpad/pop",
  "ip-tickets": "/launchpad/tickets",
  "creator-coins": "/launchpad/coin/create",
};

function NewListings({ market }: { market: CollectionMarketActions }) {
  const { walletAddress } = useMedialaneApp();
  const { orders, isLoading } = useOrders({ status: "ACTIVE", limit: 10, page: 1 });
  const prices = useUsdPrices();
  const listings = orders.filter((o) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155").slice(0, 10);
  return (
    <ScrollSection
      icon={<Tag className="h-3.5 w-3.5 text-white" />}
      iconBg="bg-gradient-to-br from-brand-rose to-brand-rose shadow-md shadow-brand-rose/20"
      title="New listings"
      href="/marketplace"
      linkLabel="Marketplace"
    >
      {isLoading
        ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-72 shrink-0 snap-start"><ListingCardSkeleton /></div>
          ))
        : listings.length === 0
        ? (
            <p className="py-4 text-sm text-muted-foreground">
              <Link href="/launchpad/single-editions" className="text-primary hover:underline">List the first asset</Link>
            </p>
          )
        : listings.map((order) => {
            const own = !!walletAddress && isSameAddress(order.offerer, walletAddress);
            return (
              <div key={order.orderHash} className="w-72 shrink-0 snap-start">
                <ListingCard
                  order={order}
                  onBuy={own ? undefined : () => market.buy(order)}
                  overflowMenu={<ListingCardMenu order={order} />}
                  usdValue={orderUsd(order.price, prices)}
                />
              </div>
            );
          })}
    </ScrollSection>
  );
}

function CollectionsStrip() {
  const { collections, isLoading } = useCollections(1, 10, undefined, "recent");
  return (
    <ScrollSection
      icon={<TrendingUp className="h-3.5 w-3.5 text-white" />}
      iconBg="bg-gradient-to-br from-brand-purple to-brand-maeve shadow-md shadow-brand-purple/20"
      title="Collections"
      href="/collections"
      linkLabel="See all"
    >
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-56 shrink-0 snap-start sm:w-64"><CollectionCardSkeleton /></div>
          ))
        : collections.map((col) => (
            <div key={col.contractAddress} className="w-64 shrink-0 snap-start"><CollectionCard collection={col} /></div>
          ))}
    </ScrollSection>
  );
}

export interface HomePageProps {
  useMarketActions: () => CollectionMarketActions;
  initialFeatured?: ApiCollection[];
}

export function HomePage({ useMarketActions, initialFeatured }: HomePageProps) {
  const market = useMarketActions();
  const { collections: featured, isLoading: featuredLoading } = useCollections(1, 3, true, "recent", true, undefined, undefined, initialFeatured);
  const { orders: tickerOrders } = useOrders({ status: "ACTIVE", sort: "recent", limit: 14 });
  return (
    <div className="pb-20">
      <HeroSlider collections={featured} isLoading={featuredLoading} getHref={(c) => collectionHref("STARKNET", c.contractAddress)} />
      <PageContainer className="box-border max-w-full pt-6 pb-0">
        <ActivityTicker orders={tickerOrders} minItems={3} getHref={(o) => assetHref("STARKNET", o.nftContract, o.nftTokenId)} />
      </PageContainer>
      <PageContainer className="mt-16 box-border max-w-full space-y-10 pt-0 pb-0 sm:space-y-16 lg:space-y-20">
        <NewListings market={market} />
        <CollectionsStrip />
        <RewardsSection rewardsHref="/rewards" />
        <LaunchpadStrip hrefs={LAUNCHPAD_HREFS} marketplaceHref="/marketplace" launchpadHref="/launchpad" />
      </PageContainer>
      {market.dialogs}
    </div>
  );
}
