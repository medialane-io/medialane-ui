"use client";

import { useEffect, useState } from "react";
import { profileHref, type ApiAccount } from "@medialane/sdk";
import { Search, Users, X } from "lucide-react";
import Link from "./link.js";
import { Input } from "./input.js";
import { Skeleton } from "./skeleton.js";
import { LoadMoreSentinel } from "./load-more-sentinel.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { useAccounts } from "../utils/use-accounts.js";
import { shortenAddress } from "../utils/address.js";

function addressGradient(address: string) {
  const hue = address.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
  return `linear-gradient(135deg, hsl(${hue},55%,40%), hsl(${(hue + 60) % 360},50%,25%))`;
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function AccountCard({ account }: { account: ApiAccount }) {
  return (
    <Link
      href={profileHref({ address: account.address })}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40 active:scale-[0.98]"
    >
      <span className="h-11 w-11 shrink-0 rounded-full ring-2 ring-white/10" style={{ background: addressGradient(account.address) }} />
      <span className="min-w-0">
        <span className="block truncate font-mono text-sm font-semibold">{shortenAddress(account.address, 6)}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {plural(account.collections, "collection")} · {plural(account.assets, "asset")}
        </span>
      </span>
    </Link>
  );
}

export function AccountsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { accounts, total, isLoading, isLoadingMore, hasMore, loadMore } = useAccounts(query);

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
            Accounts directory
          </span>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="mb-3 text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Onchain <span className="gradient-text">accounts</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.16}>
          <p className="mb-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            Every address with collections or assets onchain.
          </p>
        </FadeIn>
        <FadeIn delay={0.22}>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {!isLoading && total > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm">
                <span className="font-bold">{total}</span>
                <span className="text-muted-foreground">account{total === 1 ? "" : "s"}</span>
              </div>
            )}
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9 pr-9"
                placeholder="Search by address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
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

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />
            ))}
          </div>
        ) : accounts.length > 0 ? (
          <>
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {accounts.map((account) => (
                <StaggerItem key={account.address}>
                  <AccountCard account={account} />
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
            <p className="text-lg font-semibold">{query ? `No accounts found for "${query}"` : "No accounts yet"}</p>
          </div>
        )}
      </section>
    </div>
  );
}
