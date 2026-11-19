"use client";

import { useEffect, useState } from "react";
import { profileHref } from "@medialane/sdk";
import { Search, Users, X } from "lucide-react";
import { AssetCard, AssetCardSkeleton } from "./asset-card.js";
import { IP_TYPE_CONFIG } from "./ip-type-badge.js";
import { Input } from "./input.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { useAccounts } from "../utils/use-accounts.js";
import { shortenAddress } from "../utils/address.js";
import { cn } from "../utils/cn.js";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4";
const CHIP = "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors";

export function AccountsPage() {
  const intl = useFormat();
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
    <div className="pb-16">
      <section className="border-b border-border/50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn>
          <span className="pill-badge mb-5 inline-flex">
            <Users className="h-3 w-3" />
            {t("Accounts directory")}
          </span>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="mb-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {t("Onchain")} <span className="gradient-text">{t("accounts")}</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            {t("Every address with collections or assets onchain.")}
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {!isLoading && total > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm">
                <span className="font-bold tabular-nums">{intl.number(total)}</span>
                <span className="text-muted-foreground">{t("account")}{total === 1 ? "" : "s"}</span>
              </div>
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
        </FadeIn>
      </section>

      <section className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label={t("Type of work")}>
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-semibold">{query ? `No accounts found for "${query}"` : t("No accounts found")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
