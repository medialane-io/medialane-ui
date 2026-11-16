import { Skeleton } from "./skeleton.js";
import { TokenCardSkeleton } from "./token-card.js";
import { AssetCardSkeleton } from "./asset-card.js";
import { CollectionCardSkeleton } from "./collection-card.js";
import { ListingCardSkeleton } from "./listing-card.js";
import { PageContainer } from "./page-container.js";

export function AccountLoading() {
  return (
    <div className="space-y-6 px-4 pt-20 pb-8 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-64 sm:h-9 sm:w-80" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-hidden">
        {[104, 132, 112, 84].map((w, i) => (
          <Skeleton key={i} className="h-9 shrink-0 rounded-full" style={{ width: w }} />
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CreatorLoading() {
  return (
    <div className="pb-20 min-h-screen">

      <Skeleton className="w-full h-48 sm:h-64 rounded-none" />

      <div className="px-6">

        <div className="-mt-14 sm:-mt-16 relative z-10">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3 pb-6">
            <Skeleton className="h-[88px] w-[88px] rounded-full shrink-0 ring-[3px] ring-background" />
            <div className="flex-1 min-w-0 pb-1 space-y-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg pb-1" />
          </div>
        </div>

        <div className="border-b border-border flex gap-1 pb-0 mb-0">
          {[72, 80, 104, 76].map((w, i) => (
            <Skeleton key={i} className="h-10 rounded-none" style={{ width: w }} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivitiesLoading() {
  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CollectionsLoading() {
  return (
    <PageContainer className="box-border max-w-full pt-14 pb-8 space-y-8">
      <div className="space-y-2 pt-8">
        <Skeleton className="h-9 w-72" />
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
      </div>
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
    <PageContainer className="box-border max-w-full pt-14 pb-8 space-y-8">
      <div className="space-y-2 pt-8">
        <Skeleton className="h-9 w-64" />
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
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
          <Skeleton className="h-10 w-72 max-w-full rounded-lg" />
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
    <PageContainer className="box-border max-w-full pt-20 pb-16 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-12 rounded-full" />
      </div>
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
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
