"use client";

import { useEffect, useState } from "react";
import { profileHref } from "@medialane/sdk";
import { Search, Users, X } from "lucide-react";
import { AssetCard, AssetCardSkeleton } from "./asset-card.js";
import { IP_TYPE_CONFIG } from "./ip-type-badge.js";
import { Input } from "./input.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { StatPillRow } from "./stat-tile.js";
import { Stagger, StaggerItem } from "./motion-primitives.js";
import { useAccounts } from "../utils/use-accounts.js";
import { shortenAddress } from "../utils/address.js";
import { cn } from "../utils/cn.js";
import { useT } from "../i18n/provider.js";
import { IconTile } from "./icon-tile.js";

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4";
const CHIP = "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors bg-background/40";

export function AccountsPage() {
  const t = useT();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [ipType, setIpType] = useState("");
  const { accounts, total, isLoading, isLoadingMore, hasMore, loadMore } = useAccounts(query, ipType);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <PageContainer className="space-y-8">
      <PageHeader title={`${t("Onchain")} ${t("accounts")}`} subtitle={t("Every address with collections or assets onchain.")}>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {!isLoading && total > 0 && (
            <StatPillRow items={[{ label: `${t("account")}${total === 1 ? "" : "s"}`, value: total }]} />
          )}
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder={t("Search by address…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label={t("Clear search")}
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </PageHeader>

      <section className="space-y-6">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label={t("Content type")}>
          {[{ slug: "", label: t("All") }, ...IP_TYPE_CONFIG].map(({ slug, label }) => (
            <button
              key={slug || "all"}
              type="button"
              aria-pressed={ipType === slug}
              onClick={() => setIpType(slug)}
              className={cn(
                CHIP,
                ipType === slug
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {t(label)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className={GRID}>
            {Array.from({ length: 10 }).map((_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <>
            <Stagger className={GRID}>
              {accounts.map((account) => (
                <StaggerItem key={account.address}>
                  <AssetCard
                    href={profileHref({ address: account.address })}
                    name={shortenAddress(account.address, 6)}
                    image={account.image}
                    ipType={account.ipType}
                    fallbackId={account.address.slice(2, 8)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
            <LoadMoreSentinel hasMore={hasMore} isLoading={isLoadingMore} onLoadMore={loadMore} />
          </>
        ) : (
          <div className="space-y-4 py-24 text-center">
            <IconTile size="lg" className="mx-auto">
              <Users />
            </IconTile>
            <p className="text-lg font-semibold">{query ? `No accounts found for "${query}"` : t("No accounts found")}</p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
