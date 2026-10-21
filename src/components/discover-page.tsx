"use client";

import { assetHref, collectionHref, profileHref, type ApiCreatorProfile } from "@medialane/sdk";
import { PageContainer } from "./page-container.js";
import { DiscoverHero } from "./discover-hero.js";
import { DiscoverCollectionsStrip } from "./discover-collections-strip.js";
import { DiscoverActivityStrip } from "./discover-feed-section.js";
import { DiscoverCreatorsStrip } from "./discover-creators-strip.js";
import { DiscoverCommunitySection } from "./discover-community-section.js";
import { IpTypeNav } from "./ip-type-nav.js";
import { useMedialaneApp } from "./medialane-app.js";
import type { CollectionMarketActions } from "./collection-page.js";
import { useOrders } from "../utils/use-orders.js";
import { useCollections } from "../utils/use-collections.js";
import { useCreators } from "../utils/use-creators.js";
import { usePlatformStats } from "../utils/use-platform-stats.js";
import { isSameAddress } from "../utils/same-address.js";

export interface DiscoverPageProps {
  useMarketActions: () => CollectionMarketActions;
  heroBadge?: string;
  heroHeadline?: string;
}

export function DiscoverPage({ useMarketActions, heroBadge, heroHeadline }: DiscoverPageProps) {
  const { walletAddress } = useMedialaneApp();
  const market = useMarketActions();
  const { stats } = usePlatformStats();
  const { orders: tickerOrders } = useOrders({ status: "ACTIVE", sort: "recent", limit: 14 });
  const { orders: feedOrders, isLoading: feedLoading } = useOrders({ status: "ACTIVE", sort: "recent", limit: 10 });
  const { collections, isLoading: collectionsLoading } = useCollections(1, 8);
  const { creators, isLoading: creatorsLoading } = useCreators(undefined, 1, 10);

  return (
    <PageContainer className="box-border max-w-full space-y-14 px-4 pt-20 sm:space-y-20 sm:px-5 lg:px-6">
      <DiscoverHero
        stats={stats ?? null}
        orders={tickerOrders}
        badgeText={heroBadge}
        headlineText={heroHeadline}
        getTickerHref={(o) => assetHref("STARKNET", o.nftContract, o.nftTokenId)}
      />
      <DiscoverCollectionsStrip
        collections={collections}
        isLoading={collectionsLoading}
        getHref={(c) => collectionHref("STARKNET", c.contractAddress)}
        allCollectionsHref="/collections"
      />
      <DiscoverActivityStrip
        orders={feedOrders}
        isLoading={feedLoading}
        marketplaceHref="/marketplace"
        onBuyOrder={market.buy}
        isOwnOrder={(o) => !!walletAddress && !!o.offerer && isSameAddress(o.offerer, walletAddress)}
      />
      <IpTypeNav />
      <DiscoverCommunitySection />
      <DiscoverCreatorsStrip
        creators={creators}
        isLoading={creatorsLoading}
        getHref={(c: ApiCreatorProfile) => profileHref({ username: c.username, address: c.walletAddress })}
        allCreatorsHref="/creators"
      />
      {market.dialogs}
    </PageContainer>
  );
}
