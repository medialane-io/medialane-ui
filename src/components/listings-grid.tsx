"use client";

import { useState, useEffect, useRef } from "react";
import { normalizeAddress, type ApiOrder, type SortOrder } from "@medialane/sdk";
import Link from "./link.js";
import { Button } from "./button.js";
import { ListingCard, ListingCardSkeleton } from "./listing-card.js";
import { ListingCardMenu } from "./listing-card-menu.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useOrders } from "../utils/use-orders.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useUsdPrices, usdValueFor } from "../utils/use-usd-prices.js";
import { emptyMessages } from "../utils/empty-messages.js";

const PAGE_SIZE = 15;
const BACKEND_PAGE_SIZE = 50;

export interface ListingsGridProps {
  sort?: string;
  currency?: string;
  orderType?: string;
  minPrice?: string;
  maxPrice?: string;

  initialOrders?: ApiOrder[];
  onBuy: (order: ApiOrder) => void;
}

function MarketplaceListingCard({ order, onBuy }: { order: ApiOrder; onBuy?: (order: ApiOrder) => void }) {
  const resolveImage = useImageUrl();
  const usdPrices = useUsdPrices();
  return (
    <ListingCard
      order={order}
      onBuy={onBuy}
      overflowMenu={<ListingCardMenu order={order} />}
      imageUrl={resolveImage(order.token?.image)}
      usdValue={usdValueFor(order.price?.formatted, order.price?.currency, usdPrices)}
    />
  );
}

export function ListingsGrid({ sort = "recent", currency, orderType = "", minPrice, maxPrice, initialOrders, onBuy }: ListingsGridProps) {
  const { walletAddress } = useMedialaneApp();
  const [backendPage, setBackendPage] = useState(1);
  const [visiblePages, setVisiblePages] = useState(1);
  const [allOrders, setAllOrders] = useState<ApiOrder[]>(initialOrders ?? []);

  const prevFilters = useRef({ sort, currency, orderType, minPrice, maxPrice });
  useEffect(() => {
    const f = prevFilters.current;
    if (f.sort !== sort || f.currency !== currency || f.orderType !== orderType || f.minPrice !== minPrice || f.maxPrice !== maxPrice) {
      prevFilters.current = { sort, currency, orderType, minPrice, maxPrice };
      setBackendPage(1);
      setVisiblePages(1);
      setAllOrders([]);
    }
  }, [sort, currency, orderType, minPrice, maxPrice]);

  const { orders, meta, isLoading } = useOrders({
    status: "ACTIVE",
    sort: sort as SortOrder,
    ...(currency ? { currency } : {}),
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    page: backendPage,
    limit: BACKEND_PAGE_SIZE,
  });

  useEffect(() => {
    if (isLoading) return;
    if (backendPage === 1) {
      setAllOrders(orders);
    } else {
      setAllOrders((prev) => {
        const existing = new Set(prev.map((o) => o.orderHash));
        const newItems = orders.filter((o) => !existing.has(o.orderHash));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
  }, [orders, isLoading, backendPage]);

  const filteredOrders = orderType === "offers"
    ? allOrders.filter((o) => o.offer.itemType === "ERC20")
    : allOrders.filter((o) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155");

  const visibleLimit = visiblePages * PAGE_SIZE;
  const displayedOrders = filteredOrders.slice(0, visibleLimit);

  const isInitialLoading = isLoading && allOrders.length === 0;
  const isLoadingMore = isLoading && allOrders.length > 0;
  const backendTotal = meta?.total ?? 0;
  const hasBackendMore = backendTotal > 0
    ? allOrders.length < backendTotal
    : orders.length === BACKEND_PAGE_SIZE;
  const hasBufferedOrders = filteredOrders.length > displayedOrders.length;
  const hasMore = hasBufferedOrders || hasBackendMore || isLoadingMore;

  useEffect(() => {
    if (isLoading || !hasBackendMore || filteredOrders.length >= visibleLimit) return;
    setBackendPage((p) => p + 1);
  }, [filteredOrders.length, hasBackendMore, isLoading, visibleLimit]);

  const isOwner = (order: ApiOrder) =>
    !!walletAddress && !!order.offerer && normalizeAddress("STARKNET", order.offerer) === normalizeAddress("STARKNET", walletAddress);

  const handleLoadMore = () => {
    setVisiblePages((p) => p + 1);
  };

  if (isInitialLoading || (filteredOrders.length === 0 && hasBackendMore)) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredOrders.length === 0 && !isLoading && !hasBackendMore) {
    const empty = orderType === "offers" ? emptyMessages.offers : emptyMessages.listings;
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-2xl font-bold">{empty.title}</p>
        <p className="text-muted-foreground max-w-sm">{empty.description}</p>
        {orderType !== "offers" && (
          <Button variant="outline" asChild>
            <Link href="/create">Create &amp; List</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {displayedOrders.map((order) => (
            <MarketplaceListingCard key={order.orderHash} order={order} onBuy={isOwner(order) ? undefined : onBuy} />
          ))}
          {isLoadingMore &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ListingCardSkeleton key={`loading-${i}`} />
            ))}
        </div>

        <LoadMoreSentinel hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={handleLoadMore} />

        {!hasMore && filteredOrders.length > PAGE_SIZE && (
          <p className="text-center text-xs text-muted-foreground">
            All {filteredOrders.length} {orderType === "offers" ? "offers" : "listings"} shown
          </p>
        )}
      </div>
    </>
  );
}
