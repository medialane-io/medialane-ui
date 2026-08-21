"use client";

import Link from "./link.js";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn.js";
import { ipfsToHttp } from "../utils/ipfs.js";
import { PriceChipContent } from "./dual-price.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { AnimatedTokenMedia } from "./animated-token-media.js";

export interface AssetCardPrice {
  formatted?: string | null;
  currency?: string | null;

  usdValue?: string | null;
}

export interface AssetCardProps {

  href: string;

  name: string;

  image?: string | null;

  animationUrl?: string | null;

  live?: boolean;

  subtitle?: string | null;

  ipType?: string | null;

  price?: AssetCardPrice | null;

  fallbackId?: string | null;

  indexing?: boolean;

  ipTypeBaseUrl?: string;
  className?: string;
}

export function AssetCard({
  href,
  name,
  image,
  animationUrl,
  live = false,
  subtitle,
  ipType,
  price,
  fallbackId,
  indexing = false,
  ipTypeBaseUrl = "",
  className,
}: AssetCardProps) {
  const resolved = image ? ipfsToHttp(image) : null;
  const hasPrice = !!price?.formatted;

  return (
    <div
      className={cn(
        "group relative flex flex-col w-full overflow-hidden rounded-xl bg-card transition-colors",
        className
      )}
    >

      <Link href={href} className="block relative aspect-[4/5] bg-muted overflow-hidden">
        <AnimatedTokenMedia
          image={resolved}
          animationUrl={animationUrl}
          live={live}
          alt={name}
          mode="fill"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/25 via-brand-purple/25 to-brand-rose/25">
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                #{fallbackId ?? "?"}
              </span>
            </div>
          }
        />

        {ipType && (
          <div className="absolute top-2 right-2">
            <IpTypeBadge ipType={ipType} size="sm" baseUrl={ipTypeBaseUrl} />
          </div>
        )}

        {indexing && (
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm py-1.5">
            <Loader2 className="h-3 w-3 animate-spin text-white/70" />
            <span className="text-2xs text-white/70">Indexing…</span>
          </div>
        )}
      </Link>

      <div className="px-3 py-3 space-y-1">
        <Link href={href} className="block min-w-0">
          <p className="text-base font-bold line-clamp-1 leading-snug">
            {name}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1 leading-snug">
              {subtitle}
            </p>
          )}
        </Link>

        {hasPrice && !indexing && (
          <div className="flex items-center gap-1.5 text-sm font-bold tabular-nums pt-0.5">
            <PriceChipContent
              amountFormatted={price!.formatted}
              currency={price!.currency}
              usdValue={price!.usdValue}
              tone="solid"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="flex flex-col w-full overflow-hidden rounded-xl bg-card">
      <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
      <div className="px-3 py-3 space-y-1.5">
        <div className="h-4 w-3/4 rounded-md animate-pulse bg-muted" />
        <div className="h-3.5 w-2/5 rounded-md animate-pulse bg-muted" />
      </div>
    </div>
  );
}
