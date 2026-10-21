"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ApiToken } from "@medialane/sdk";
import { ImageIcon } from "lucide-react";
import { EmptyOrError } from "./empty-or-error.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { TokenCard } from "./token-card.js";
import { useMedialaneApp } from "./medialane-app.js";
import { orderUsd } from "../utils/order-usd.js";
import { useUsdPrices } from "../utils/use-usd-prices.js";
import { useTokensByOwner } from "../utils/use-tokens.js";

export interface PortfolioAssetActions {
  list: (token: ApiToken) => void;
  transfer: (token: ApiToken) => void;
  cancel: (token: ApiToken) => void;
  dialogs?: ReactNode;
}

export type UsePortfolioAssetActions = (context: { refresh: () => void }) => PortfolioAssetActions;

const PAGE_SIZE = 20;
const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";

function usdFor(token: ApiToken, prices: ReturnType<typeof useUsdPrices>): string | null {
  const order = token.activeOrders?.find((o) => o.offer.itemType === "ERC721" || o.offer.itemType === "ERC1155");
  return orderUsd(order?.price, prices);
}

export function PortfolioAssets({ address, useActions }: { address: string; useActions: UsePortfolioAssetActions }) {
  const { ReportDialog } = useMedialaneApp();
  const [page, setPage] = useState(1);
  const [all, setAll] = useState<ApiToken[]>([]);
  const [reportToken, setReportToken] = useState<ApiToken | null>(null);
  const { tokens, meta, isLoading, error, mutate } = useTokensByOwner(address, page, PAGE_SIZE);
  const prices = useUsdPrices();

  useEffect(() => setAll((prev) => (page === 1 ? tokens : [...prev, ...tokens])), [tokens, page]);
  useEffect(() => { setPage(1); setAll([]); }, [address]);

  const actions = useActions({ refresh: () => { setPage(1); setAll([]); void mutate(); } });
  const shown = page === 1 ? tokens : all;
  const hasMore = meta ? (meta.total ?? 0) > shown.length : false;

  return (
    <>
      <EmptyOrError
        isLoading={isLoading && page === 1}
        error={error}
        isEmpty={shown.length === 0 && !isLoading}
        onRetry={() => void mutate()}
        emptyTitle="No assets yet"
        emptyDescription="Create your first asset to get started."
        emptyCta={{ label: "Create your first asset", href: "/launchpad/single-editions" }}
        emptyIcon={<ImageIcon className="h-7 w-7 text-muted-foreground" />}
        skeletonNode={
          <div className={GRID}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl bg-muted">
                <div className="aspect-square w-full bg-muted-foreground/10" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/10" />
                  <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className={GRID}>
          {shown.map((token) => (
            <TokenCard
              key={`${token.contractAddress}-${token.tokenId}`}
              token={token}
              isOwner
              usdValue={usdFor(token, prices)}
              onList={actions.list}
              onTransfer={actions.transfer}
              onCancel={actions.cancel}
              onReport={ReportDialog ? setReportToken : undefined}
            />
          ))}
        </div>
        <LoadMoreSentinel hasMore={hasMore} isLoading={isLoading} onLoadMore={() => setPage((p) => p + 1)} />
      </EmptyOrError>
      {actions.dialogs}
      {ReportDialog && reportToken && (
        <ReportDialog
          open={!!reportToken}
          onOpenChange={(open) => { if (!open) setReportToken(null); }}
          target={{ type: "TOKEN", contract: reportToken.contractAddress, tokenId: reportToken.tokenId, name: reportToken.metadata?.name ?? undefined }}
        />
      )}
    </>
  );
}
