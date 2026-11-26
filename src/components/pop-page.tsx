"use client";

import { useState } from "react";
import { Award, Users, Plus, LayoutList } from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import { BackButton } from "./back-button.js";
import { Button } from "./button.js";
import Image from "./image.js";
import Link from "./link.js";
import { FadeIn, Stagger, StaggerItem } from "./motion-primitives.js";
import { PageContainer } from "./page-container.js";
import { PageHeader } from "./page-header.js";
import { PopClaimButton } from "./pop-claim-button.js";
import { SectionHeading } from "./section-heading.js";
import { Skeleton } from "./skeleton.js";
import { useImageUrl } from "../utils/use-image-url.js";
import { usePopCollections } from "../utils/use-pop.js";
import { useT } from "../i18n/provider.js";
import { useFormat } from "../i18n/use-format.js";

type CollectionWithAttributes = ApiCollection & {
  attributes?: { trait_type?: string; value?: string }[];
};

function PopCollectionCard({ collection }: { collection: ApiCollection }) {
  const intl = useFormat();
  const t = useT();
  const resolveImage = useImageUrl();
  const [imgError, setImgError] = useState(false);
  const imageUrl = resolveImage(collection.image);
  const showImage = imageUrl && !imgError;
  const initial = (collection.name ?? "P").charAt(0).toUpperCase();

  return (
    <div className="bento-cell overflow-hidden flex flex-col">

      <div className="relative aspect-square w-full overflow-hidden bg-muted shrink-0">
        {showImage ? (
          <Image
            src={imageUrl}
            alt={collection.name ?? t("POP collection")}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-brand-blue/30 flex items-center justify-center">
            <span className="text-7xl font-black text-white/10 select-none">{initial}</span>
          </div>
        )}
        <span className="absolute top-2 right-2 text-2xs font-bold uppercase tracking-widest text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
          {t("POP")}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex-1 space-y-1">
          <p className="font-bold text-sm leading-tight">{collection.name ?? t("Unnamed event")}</p>
          {collection.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {collection.totalSupply != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {t("{totalSupply} claimed", { totalSupply: intl.number(collection.totalSupply) })}</span>
          )}
          {collection.symbol && (
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              {collection.symbol}
            </span>
          )}
        </div>
        <PopClaimButton collectionAddress={collection.contractAddress} />
      </div>
    </div>
  );
}

function PopCollectionCardSkeleton() {
  return (
    <div className="bento-cell overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export function PopPage() {
  const t = useT();
  const { collections, isLoading } = usePopCollections();

  const publicCollections = collections.filter(
    (c) =>
      (c as CollectionWithAttributes).attributes?.find((a) => a.trait_type === "Visibility")?.value !== "Private"
  );

  return (
    <PageContainer variant="narrow" className="space-y-8">

      <PageHeader
        back={<BackButton />}
        icon={<Award />}
        title={t("POP events")}
        subtitle={t("Browse events or create one.")}
      />

      <section className="space-y-4">
        <FadeIn>
          <SectionHeading
            title={t("Open for claiming")}
            action={
              <div className="flex items-center gap-2">
                <Button asChild variant="soft" size="sm" className="gap-1.5">
                  <Link href="/launchpad/pop/my-events">
                    <LayoutList className="h-3.5 w-3.5" />
                    {t("My events")}
                  </Link>
                </Button>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                  <Link href="/launchpad/pop/create">
                    <Plus className="h-3.5 w-3.5" />
                    {t("Create event")}
                  </Link>
                </Button>
              </div>
            }
          />
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <PopCollectionCardSkeleton key={i} />)}
          </div>
        ) : publicCollections.length === 0 ? (
          <FadeIn>
            <div className="bento-cell border-dashed p-16 text-center space-y-3">
              <div className="flex justify-center">
                <Award className="h-10 w-10 text-muted-foreground/20" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("Events appear here when live.")}
              </p>
            </div>
          </FadeIn>
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicCollections.map((col) => (
              <StaggerItem key={col.contractAddress}>
                <PopCollectionCard collection={col} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

    </PageContainer>
  );
}
