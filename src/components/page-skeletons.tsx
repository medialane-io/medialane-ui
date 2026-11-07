import { Skeleton } from "./skeleton.js";

export function AccountLoading() {
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
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="relative rounded-xl border border-border overflow-hidden">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
              <Skeleton className="h-4 w-2/3 bg-muted-foreground/20" />
              <Skeleton className="h-3 w-1/3 bg-muted-foreground/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketplaceLoading() {
  return (
    <div className="px-4 py-8 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-3 pb-2 border-b border-border/60">
        <Skeleton className="h-9 w-full sm:max-w-sm" />
        <Skeleton className="h-7 w-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
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
