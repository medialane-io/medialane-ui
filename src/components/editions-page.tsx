"use client";

import { useState, useMemo } from "react";
import { collectionHref } from "@medialane/sdk";
import Link from "./link.js";
import Image from "./image.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { Skeleton } from "./skeleton.js";
import { Button } from "./button.js";
import { BackButton } from "./back-button.js";
import { SignInPrompt } from "./sign-in-prompt.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useCollectionsByOwner } from "../utils/use-collections.js";
import { useImageUrl } from "../utils/use-image-url.js";
import {
  Layers, Sparkles, Plus, ArrowRight, Package,
  ExternalLink, Inbox,
} from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";
import { ActionButton } from "./action-button.js";

function CollectionRow({ col }: { col: ApiCollection }) {
  const intl = useFormat();
  const t = useT();
  const [imgError, setImgError] = useState(false);
  const imageUrl = useImageUrl()(col.image, { width: 128 });
  const showImage = imageUrl && !imgError;

  return (
    <div className="group panel relative overflow-hidden flex flex-col sm:flex-row items-stretch">

      <div className="relative w-full sm:w-32 aspect-square shrink-0 overflow-hidden bg-muted sm:self-start sm:m-5 sm:mr-0 sm:rounded-xl">
        {showImage ? (
          <Image
            src={imageUrl}
            alt={col.name ?? ""}
            fill
            className="object-cover card-media"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Layers className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 p-5 flex-1 min-w-0">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight truncate">
                {col.name ?? t("Unnamed collection")}
              </p>
              {col.symbol && (
                <p className="text-xs tabular-nums text-muted-foreground mt-0.5">{col.symbol}</p>
              )}
            </div>
            <Link
              href={collectionHref("STARKNET", col.contractAddress)}
              className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              title={t("View collection page")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {col.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {col.description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>
                {col.totalSupply != null
                  ? `${intl.number(col.totalSupply)} token${col.totalSupply !== 1 ? "s" : ""}`
                  : t("No tokens yet")}
              </span>
            </div>
            {col.holderCount != null && col.holderCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {t.plural("{count} holder", "{count} holders", col.holderCount, { count: intl.number(col.holderCount) })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionButton solid small asChild>
            <Link href={`/launchpad/nfteditions/${col.contractAddress}/mint`}>
              <Sparkles className="h-3.5 w-3.5" />
              {t("Mint editions")}
            </Link>
          </ActionButton>
          <Button variant="soft" size="sm" asChild>
            <Link href={collectionHref("STARKNET", col.contractAddress)}>
              {t("View collection")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CollectionRowSkeleton() {
  return (
    <div className="panel relative overflow-hidden flex flex-col sm:flex-row">
      <Skeleton className="w-full sm:w-32 aspect-square shrink-0 rounded-none sm:self-start sm:m-5 sm:mr-0 sm:rounded-xl" />
      <div className="flex flex-col gap-3 p-5 flex-1">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-64" />
        <div className="flex gap-2 mt-auto">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function EditionsPage() {
  const t = useT();
  const { walletAddress, walletLoading } = useMedialaneApp();
  const { collections, isLoading } = useCollectionsByOwner(walletAddress);

  const erc1155 = useMemo(
    () => collections.filter((c) => c.standard === "ERC1155"),
    [collections]
  );

  return (
    <PageContainer variant="narrow" className="space-y-8">

      <PageHeader
        back={<BackButton />}
        icon={<Layers />}
        title={t("Limited Editions")}
        subtitle={t("Pick one of your editions collections and mint new pieces into it.")}
      >
        <div className="flex items-center gap-3">
          <ActionButton solid asChild>
            <Link href="/launchpad/nfteditions/create">
              <Plus className="h-4 w-4" />
              {t("New collection")}
            </Link>
          </ActionButton>
          <Button variant="soft" size="sm" asChild>
            <a href="https://docs.medialane.io/learn/ip-collection-1155" target="_blank" rel="noopener noreferrer">
              {t("Learn more")} <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </a>
          </Button>
        </div>
      </PageHeader>

      <section className="space-y-5">
        {!walletAddress && !walletLoading ? (
          <SignInPrompt icon={<Layers className="h-10 w-10 text-muted-foreground/30" />} title={t("Sign in to see your collections")} />
        ) : isLoading || walletLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CollectionRowSkeleton key={i} />
            ))}
          </div>
        ) : erc1155.length === 0 ? (
          <FadeIn>
            <div className="panel relative overflow-hidden p-10 flex flex-col items-center gap-4 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/30" />
              <div>
                <p className="font-semibold">{t("No editions collections yet")}</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {t("Create your first editions collection to start minting.")}
                </p>
              </div>
              <ActionButton solid small asChild>
                <Link href="/launchpad/nfteditions/create">
                  <Plus className="h-4 w-4" />
                  {t("Create your first collection")}
                </Link>
              </ActionButton>
            </div>
          </FadeIn>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t.plural("{count} collection", "{count} collections", erc1155.length)}
              </p>
            </div>
            <Stagger className="space-y-3">
              {erc1155.map((col) => (
                <StaggerItem key={col.contractAddress}>
                  <CollectionRow col={col} />
                </StaggerItem>
              ))}
            </Stagger>
          </>
        )}
      </section>

    </PageContainer>
  );
}
