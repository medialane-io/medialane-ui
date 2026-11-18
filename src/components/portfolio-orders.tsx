"use client";

import type { ReactNode } from "react";
import { assetHref, profileHref, type ApiOrder } from "@medialane/sdk";
import { ArrowLeftRight, ExternalLink, HandCoins, Inbox, Tag } from "lucide-react";
import Image from "./image.js";
import Link from "./link.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import { EmptyOrError } from "./empty-or-error.js";
import { Skeleton } from "./skeleton.js";
import { cn } from "../utils/cn.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { formatDisplayPrice } from "../utils/format.js";
import { isExpired, timeUntil } from "../utils/time.js";
import { isSameAddress } from "../utils/same-address.js";
import { getSeenOffers } from "../utils/seen-offers.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { useCounterOffers, useReceivedOffers, useUserOrders } from "../utils/use-orders.js";
import { useT } from "../i18n/provider.js";

export type PortfolioOrdersView = "listings" | "offers" | "received" | "counter-offers";

export interface PortfolioOrderActions {
  isProcessing: boolean;
  cancel?: (order: ApiOrder) => void;
  accept?: (order: ApiOrder, original?: ApiOrder) => void;
  counter?: (order: ApiOrder) => void;
  dialogs?: ReactNode;
}

export type UsePortfolioOrderActions = (context: { view: PortfolioOrdersView; refresh: () => void }) => PortfolioOrderActions;

const VIEWS = {
  listings: {
    emptyTitle: "No active listings",
    emptyDescription: "Sell an asset to get started.",
    emptyCta: { label: "Browse assets", href: "/portfolio/assets" },
    emptyIcon: Tag,
    priceLabel: "Price",
    count: (n: number) => `${n} active listing${n === 1 ? "" : "s"}`,
  },
  offers: {
    emptyTitle: "No offers sent yet",
    emptyDescription: "Browse the marketplace to make offers on assets.",
    emptyCta: { label: "Browse marketplace", href: "/marketplace" },
    emptyIcon: HandCoins,
    priceLabel: "Offer price",
    count: (n: number) => `${n} active offer${n === 1 ? "" : "s"}`,
  },
  received: {
    emptyTitle: "No offers received yet",
    emptyDescription: "When someone makes an offer on your asset, it will appear here.",
    emptyCta: undefined,
    emptyIcon: Inbox,
    priceLabel: "Offer price",
    count: null,
  },
  "counter-offers": {
    emptyTitle: "No counter-offers yet",
    emptyDescription: "When a seller responds to your bid with a counter-offer, it will appear here.",
    emptyCta: undefined,
    emptyIcon: Inbox,
    priceLabel: "Their price / Your bid",
    count: null,
  },
} as const;

const isNft = (o: ApiOrder) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155";

function expiryOf(order: ApiOrder) {
  const expired = isExpired(order.endTime);
  const urgent = !expired && Number(order.endTime) * 1000 - Date.now() < 86400000;
  return { label: timeUntil(order.endTime), expired, urgent };
}

function price(o: ApiOrder) {
  return `${formatDisplayPrice(o.price.formatted)} ${o.price.currency ?? ""}`.trim();
}

function OrderRowsSkeleton() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="hidden h-4 w-20 sm:block" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function OrderRow({ order, subtitle, from, priceCell, actions, isNew }: {
  order: ApiOrder;
  subtitle: ReactNode;
  from?: string;
  priceCell: ReactNode;
  actions: ReactNode;
  isNew?: boolean;
}) {
  const t = useT();
  const resolveImage = useImageUrl();
  const name = order.token?.name || `#${order.nftTokenId}`;
  const image = resolveImage(order.token?.image, { width: 96 });
  const expiry = expiryOf(order);
  return (
    <div data-new={isNew ? "true" : undefined} className={cn("flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40", isNew && "border-l-2 border-primary")}>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {image && <Image src={image} alt={name} fill sizes="48px" unoptimized className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={assetHref("STARKNET", order.nftContract, order.nftTokenId)} className="block truncate text-sm font-medium transition-colors hover:text-primary">
          {name}
        </Link>
        {subtitle}
      </div>
      {from && (
        <div className="hidden shrink-0 sm:block">
          <Link href={profileHref({ address: from })} className="text-xs tabular-nums text-muted-foreground transition-colors hover:text-foreground">
            {from.slice(0, 6)}…{from.slice(-4)}
          </Link>
        </div>
      )}
      <div className="hidden shrink-0 text-right sm:block">{priceCell}</div>
      <div className="hidden shrink-0 md:block">
        <p className={cn("text-sm", expiry.expired && "text-muted-foreground", expiry.urgent && "font-medium text-destructive")}>{expiry.label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {order.txHash?.created && (
          <a href={`${EXPLORER_URL}/tx/${order.txHash.created}`} target="_blank" rel="noopener noreferrer" aria-label={t("View on explorer")} className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
        )}
        {actions}
      </div>
    </div>
  );
}

function PriceText({ order }: { order: ApiOrder }) {
  return (
    <p className="text-sm font-semibold">
      {formatDisplayPrice(order.price.formatted)} <span className="text-xs font-normal text-muted-foreground">{order.price.currency}</span>
    </p>
  );
}

function CounterOfferRow({ bid, actions }: { bid: ApiOrder; actions: PortfolioOrderActions }) {
  const t = useT();
  const { counterOffers } = useCounterOffers({ originalOrderHash: bid.orderHash });
  const counter = counterOffers[0];
  if (!counter) return null;
  const closed = counter.status !== "ACTIVE" || isExpired(counter.endTime);
  return (
    <OrderRow
      order={counter}
      subtitle={
        <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-2xs">
          <ArrowLeftRight className="mr-1 h-2.5 w-2.5" />
          {t("Counter-offer")}
        </Badge>
      }
      priceCell={
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-xs text-muted-foreground line-through">{price(bid)}</p>
          <p className="text-sm font-semibold">{counter.price.formatted ? price(counter) : "—"}</p>
        </div>
      }
      actions={
        closed ? (
          <span className="text-xs text-muted-foreground">{counter.status !== "ACTIVE" ? counter.status.toLowerCase() : t("Expired")}</span>
        ) : (
          <Button size="sm" className="h-8 text-xs" disabled={actions.isProcessing} onClick={() => actions.accept?.(counter, bid)}>
            {t("Accept")}
          </Button>
        )
      }
    />
  );
}

export function PortfolioOrders({ view, address, useActions }: {
  view: PortfolioOrdersView;
  address: string;
  useActions: UsePortfolioOrderActions;
}) {
  const t = useT();
  const mine = useUserOrders(view === "received" ? null : address);
  const received = useReceivedOffers(view === "received" ? address : null);
  const source = view === "received" ? received : mine;
  const actions = useActions({ view, refresh: () => void source.mutate() });
  const config = VIEWS[view];

  const orders =
    view === "listings" ? mine.orders.filter((o) => isNft(o) && o.status === "ACTIVE")
    : view === "offers" ? mine.orders.filter((o) => o.offer.itemType === "ERC20" && o.status === "ACTIVE")
    : view === "counter-offers" ? mine.orders.filter((o) => o.offer.itemType === "ERC20" && isSameAddress(o.offerer, address) && o.hasActiveCounterOffer === true)
    : received.orders;

  const seen = view === "received" ? getSeenOffers() : null;
  const EmptyIcon = config.emptyIcon;

  return (
    <>
      <EmptyOrError
        isLoading={source.isLoading}
        error={source.error}
        isEmpty={orders.length === 0}
        onRetry={() => void source.mutate()}
        emptyTitle={config.emptyTitle}
        emptyDescription={config.emptyDescription}
        emptyCta={config.emptyCta}
        emptyIcon={<EmptyIcon className="h-7 w-7 text-muted-foreground" />}
        skeletonNode={<OrderRowsSkeleton />}
      >
        <div className="space-y-1">
          {config.count && orders.length > 0 && <p className="pb-2 text-sm text-muted-foreground">{config.count(orders.length)}</p>}
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">
              <div className="w-12 shrink-0" />
              <div className="flex-1">{t("Asset")}</div>
              {view === "received" && <div className="hidden w-28 sm:block">{t("From")}</div>}
              <div className={cn("hidden text-right sm:block", view === "counter-offers" ? "w-40" : "w-24")}>{config.priceLabel}</div>
              <div className="hidden w-28 md:block">{t("Expires")}</div>
              <div className="w-24 text-right">{t("Actions")}</div>
            </div>
            {view === "counter-offers"
              ? orders.map((bid) => <CounterOfferRow key={bid.orderHash} bid={bid} actions={actions} />)
              : orders.map((order) => (
                  <OrderRow
                    key={order.orderHash}
                    order={order}
                    isNew={seen ? !seen.has(order.orderHash) : false}
                    from={view === "received" ? order.offerer : undefined}
                    subtitle={<span className="text-xs text-muted-foreground">{view === "received" ? t("Received offer") : view === "offers" ? t("Offer") : t("Active")}</span>}
                    priceCell={<PriceText order={order} />}
                    actions={
                      view === "received" ? (
                        <>
                          <Button size="sm" variant="outline" className="h-8 text-xs" disabled={actions.isProcessing} onClick={() => actions.counter?.(order)}>{t("Counter")}</Button>
                          <Button size="sm" className="h-8 text-xs" disabled={actions.isProcessing} onClick={() => actions.accept?.(order)}>{t("Accept")}</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:text-destructive" disabled={actions.isProcessing} onClick={() => actions.cancel?.(order)}>{t("Cancel")}</Button>
                      )
                    }
                  />
                ))}
          </div>
        </div>
      </EmptyOrError>
      {actions.dialogs}
    </>
  );
}
