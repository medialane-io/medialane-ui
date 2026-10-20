"use client";

import { useEffect, useRef, useState } from "react";
import { assetHref, collectionHref, profileHref } from "@medialane/sdk";
import { Search, X } from "lucide-react";
import Link from "./link.js";
import { useRouter, useSearchParams } from "./router.js";
import { Input } from "./input.js";
import { Button } from "./button.js";
import { Skeleton } from "./skeleton.js";
import { PageContainer } from "./page-container.js";
import { AssetCard } from "./asset-card.js";
import { ResultThumbnail } from "./result-thumbnail.js";
import { profileIdentity } from "../utils/profile-identity.js";
import { useSearch } from "../utils/use-search.js";

const INPUT_DEBOUNCE_MS = 350;
const RESULT_LIMIT = 50;
const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4";
const ROWS = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2";

function ResultLink({ href, label, description, thumbnail }: { href: string; label: string; description?: string | null; thumbnail: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
      {thumbnail}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        {description && <span className="block truncate text-xs text-muted-foreground">{description}</span>}
      </span>
    </Link>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">
        {title} <span className="font-normal text-muted-foreground">({count})</span>
      </h2>
      {children}
    </section>
  );
}

export function SearchPage() {
  const router = useRouter();
  const q = useSearchParams()?.get("q") ?? "";
  const [inputValue, setInputValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { results, isLoading, error } = useSearch(q, { limit: RESULT_LIMIT });

  useEffect(() => setInputValue(q), [q]);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function navigate(value: string) {
    const v = value.trim();
    router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(value), INPUT_DEBOUNCE_MS);
  }

  function handleClear() {
    setInputValue("");
    navigate("");
  }

  const creators = results?.creators ?? [];
  const collections = results?.collections ?? [];
  const tokens = results?.tokens ?? [];
  const total = creators.length + collections.length + tokens.length;
  const showEmpty = Boolean(q.trim()) && !isLoading && (Boolean(error) || (results !== null && total === 0));

  return (
    <PageContainer className="box-border max-w-full space-y-8 pt-14 pb-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            className="h-11 pl-9 pr-10 text-base"
            placeholder="Search assets, collections, creators…"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {results && total > 0 && (
          <p className="text-sm text-muted-foreground">{`${total} result${total === 1 ? "" : "s"} for "${q.trim()}"`}</p>
        )}
      </div>

      {!q.trim() && (
        <p className="py-24 text-center text-muted-foreground">Type above to search assets, collections and creators.</p>
      )}

      {isLoading && (
        <div className={GRID}>
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-xl" />)}
        </div>
      )}

      {showEmpty && <p className="py-24 text-center font-medium">{`Nothing here for "${q.trim()}" yet`}</p>}

      {!isLoading && total > 0 && (
        <>
          {creators.length > 0 && (
            <Section title="Creators" count={creators.length}>
              <div className={ROWS}>
                {creators.map((c) => {
                  const { identity, name } = profileIdentity(c);
                  return (
                    <ResultLink
                      key={c.walletAddress}
                      href={profileHref({ username: c.username, address: c.walletAddress })}
                      label={identity}
                      description={name}
                      thumbnail={<ResultThumbnail src={c.avatarImage} label={identity} round />}
                    />
                  );
                })}
              </div>
            </Section>
          )}
          {collections.length > 0 && (
            <Section title="Collections" count={collections.length}>
              <div className={ROWS}>
                {collections.map((col) => {
                  const label = col.name ?? "Untitled";
                  return (
                    <ResultLink
                      key={col.contractAddress}
                      href={collectionHref("STARKNET", col.contractAddress)}
                      label={label}
                      thumbnail={<ResultThumbnail src={col.image} label={label} />}
                    />
                  );
                })}
              </div>
            </Section>
          )}
          {tokens.length > 0 && (
            <Section title="Assets" count={tokens.length}>
              <div className={GRID}>
                {tokens.map((t) => (
                  <AssetCard
                    key={`${t.contractAddress}-${t.tokenId}`}
                    href={assetHref("STARKNET", t.contractAddress, t.tokenId)}
                    name={t.name ?? `#${t.tokenId}`}
                    image={t.image}
                  />
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </PageContainer>
  );
}
