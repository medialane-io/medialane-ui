import { Skeleton } from "./skeleton.js";
import { TokenCardSkeleton } from "./token-card.js";
import { AssetCardSkeleton } from "./asset-card.js";
import { CollectionCardSkeleton } from "./collection-card.js";
import { ListingCardSkeleton } from "./listing-card.js";
import { PageContainer } from "./page-container.js";
import { PageHeaderSkeleton } from "./page-header.js";
import { CreatorHeader } from "./creator-header.js";
import { ActivityListSkeleton } from "./activity-row.js";

const GRID = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4";

export function AccountLoading() {
  return (
    <PageContainer className="min-h-screen space-y-8">
      <PageHeaderSkeleton />

      <div className="flex items-center gap-1.5 overflow-hidden">
        {[104, 132, 112, 84].map((w, i) => (
          <Skeleton key={i} className="h-9 shrink-0 rounded-full" style={{ width: w }} />
        ))}
      </div>

      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}

export function CreatorLoading() {
  return (
    <div className="min-h-screen pb-20">
      <div className="px-6 pt-20 pb-6">
        <CreatorHeader creator={null} image={null} stats={[]} loading />
      </div>
      <div className="mt-4 flex items-center gap-0.5 px-6">
        {[64, 92, 72, 68].map((w, i) => (
          <div key={i} className="px-4 py-3">
            <Skeleton className="h-4" style={{ width: w }} />
          </div>
        ))}
      </div>
      <div className={`mt-6 px-6 ${GRID}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ActivitiesLoading() {
  return (
    <PageContainer className="space-y-8">
      <PageHeaderSkeleton />
      <div className="space-y-5">
        <Skeleton className="h-5 w-36" />
        <div className="flex flex-wrap gap-2">
          {[44, 64, 62, 78, 70, 88, 90].map((w, i) => (
            <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
          ))}
        </div>
        <ActivityListSkeleton />
      </div>
    </PageContainer>
  );
}

export function CollectionsLoading() {
  return (
    <PageContainer className="space-y-8">
      <PageHeaderSkeleton stats={2} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}

export function MarketplaceLoading() {
  return (
    <PageContainer className="space-y-8">
      <PageHeaderSkeleton stats={2} />
      <Skeleton className="h-10 w-full rounded-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}

export function CollectionLoading() {
  return (
    <div className="relative z-0 min-h-screen">
      <div className="px-4 sm:px-6 pt-20 pb-6">
        <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 items-start lg:max-w-5xl lg:mx-auto">
          <Skeleton className="w-full sm:w-44 lg:w-56 shrink-0 rounded-2xl aspect-square" />
          <div className="flex-1 w-full space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 pb-12 space-y-4">
        <div className="flex items-center gap-2 pt-3">
          <Skeleton className="h-10 w-72 max-w-full rounded-2xl" />
          <Skeleton className="ml-auto h-9 w-9 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function IpTypeLoading() {
  return (
    <PageContainer className="space-y-8">
      <PageHeaderSkeleton stats={1} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}

export function PortfolioLoading() {
  return (
    <div className={GRID}>
      {Array.from({ length: 10 }).map((_, i) => (
        <TokenCardSkeleton key={i} />
      ))}
    </div>
  );
}
