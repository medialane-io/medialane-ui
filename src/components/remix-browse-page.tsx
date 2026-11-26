"use client";

import { useEffect, useState } from "react";
import Link from "./link.js";
import Image from "./image.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { BackButton } from "./back-button.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { Skeleton } from "./skeleton.js";
import { Button } from "./button.js";
import { useMedialaneClient } from "../utils/use-medialane-client.js";
import { useImageUrl } from "../utils/use-image-url.js";
import type { ApiToken } from "@medialane/sdk";
import { GitBranch, ImageIcon, Inbox } from "lucide-react";
import { useT } from "../i18n/provider.js";

const PAGE_SIZE = 24;

function useRemixableTokens() {
  const client = useMedialaneClient();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    client.api.tokens.list({ derivatives: "allowed", limit: PAGE_SIZE, page })
      .then((json) => {
        if (cancelled) return;
        setTokens((prev) => (page === 1 ? json.data : [...prev, ...json.data]));
        setHasMore(page * PAGE_SIZE < (json.meta?.total ?? 0));
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [client, page]);

  return { tokens, isLoading, hasMore, error, loadMore: () => setPage((p) => p + 1) };
}

function RemixableCard({ token }: { token: ApiToken }) {
  const t = useT();
  const [imgError, setImgError] = useState(false);
  const imageUrl = useImageUrl()(token.metadata?.image, { width: 480 });
  const showImage = imageUrl && !imgError;
  const name = token.metadata?.name ?? `#${token.tokenId}`;

  return (
    <Link
      href={`/create/remix/${token.contractAddress}/${token.tokenId}`}
      className="panel group flex flex-col overflow-hidden transition-colors sm:hover:border-brand-blue/50 active:scale-[0.99] motion-reduce:transform-none"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {showImage ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover card-media"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <p className="font-semibold text-sm leading-tight truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {t("Derivatives: allowed")}
        </p>
        <p className="text-xs font-semibold pt-1 inline-flex items-center gap-1.5">
          <GitBranch className="h-3 w-3" />
          {t("Remix this NFT")}
        </p>
      </div>
    </Link>
  );
}

function RemixableCardSkeleton() {
  return (
    <div className="panel overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function RemixBrowsePage() {
  const t = useT();
  const { tokens, isLoading, hasMore, error, loadMore } = useRemixableTokens();

  return (
    <PageContainer variant="narrow" className="space-y-8">
      <PageHeader
        back={<BackButton />}
        icon={<GitBranch />}
        title={t("Remix")}
        subtitle={t("Pick an NFT open to remixing.")}
      />

      <section className="space-y-6">
        {isLoading && tokens.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RemixableCardSkeleton key={i} />
            ))}
          </div>
        ) : error && tokens.length === 0 ? (
          <div className="panel relative overflow-hidden p-10 flex flex-col items-center gap-3 text-center">
            <p className="font-semibold">{t("Could not load NFTs")}</p>
            <p className="text-sm text-muted-foreground">{t("Check your connection and try again.")}</p>
            <Button variant="soft" size="sm" onClick={() => location.reload()}>{t("Retry")}</Button>
          </div>
        ) : tokens.length === 0 ? (
          <FadeIn>
            <div className="panel relative overflow-hidden p-10 flex flex-col items-center gap-4 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/30" />
              <div>
                <p className="font-semibold">{t("No NFTs open to remixing yet")}</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {t("Remixable NFTs appear here.")}
                </p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <>
            <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tokens.map((t) => (
                <StaggerItem key={`${t.contractAddress}-${t.tokenId}`}>
                  <RemixableCard token={t} />
                </StaggerItem>
              ))}
            </Stagger>
            {hasMore && (
              <div className="flex justify-center">
                <Button variant="soft" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? t("Loading…") : t("Load more")}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </PageContainer>
  );
}
