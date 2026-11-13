"use client";

import Link from "./link.js";
import { Fingerprint, Loader2 } from "lucide-react";
import { cn } from "../utils/cn.js";
import { CurrencyIcon, hasCurrencyIcon } from "./currency-icon.js";
import { formatCompactPrice } from "../utils/format.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { AnimatedTokenMedia } from "./animated-token-media.js";
import { useImageUrl } from "../utils/use-image-url.js";

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

  soulbound?: boolean;

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
  soulbound = false,
  ipTypeBaseUrl = "",
  className,
}: AssetCardProps) {
  const resolveImage = useImageUrl();
  const resolved = resolveImage(image, { width: 480 });
  const hasPrice = !!price?.formatted && !indexing;

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-[calc(var(--radius)*1.25)]",
        className
      )}
    >
      {ipType && (
        <div className="absolute top-2 right-2 z-10">
          <IpTypeBadge
            ipType={ipType}
            size="sm"
            baseUrl={ipTypeBaseUrl}
            className="bg-black/40 backdrop-blur-sm"
          />
        </div>
      )}

      <Link href={href} className="block relative aspect-square bg-foreground/[0.04] overflow-hidden">
        <AnimatedTokenMedia
          image={resolved}
          animationUrl={animationUrl}
          live={live}
          alt={name}
          mode="fill"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          className="object-cover"
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/25 via-brand-purple/25 to-brand-rose/25">
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                #{fallbackId ?? "?"}
              </span>
            </div>
          }
        />

        <div className="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
          {indexing && (
            <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-white bg-black/30 backdrop-blur-md">
              <Loader2 className="h-3 w-3 animate-spin" />
              Indexing…
            </span>
          )}

          {(hasPrice || soulbound) && (
            <div className="flex flex-wrap items-center gap-1">
              {soulbound && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white bg-black/30 backdrop-blur-md">
                  <Fingerprint className="h-3 w-3" aria-hidden />
                  Soulbound
                </span>
              )}
              {hasPrice && (
                <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold tabular-nums text-white bg-black/30 backdrop-blur-md">
                  <CurrencyIcon symbol={price!.currency} size={14} />
                  {formatCompactPrice(price!.formatted!)}
                  {price!.currency && !hasCurrencyIcon(price!.currency) ? ` ${price!.currency}` : ""}
                </span>
              )}
            </div>
          )}

          <p className="max-w-full truncate rounded-full px-3.5 py-1.5 text-base font-bold leading-tight text-white bg-black/30 backdrop-blur-md">
            {name}
          </p>
          {subtitle && (
            <p className="max-w-full truncate rounded-full px-3 py-1 text-xs font-medium leading-tight text-white bg-black/30 backdrop-blur-md">
              {subtitle}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[calc(var(--radius)*1.25)]">
      <div className="relative aspect-square w-full overflow-hidden bg-foreground/[0.04]">
        <div className="absolute inset-0 animate-pulse bg-foreground/[0.04]" />
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
          <div className="h-4 w-2/3 rounded-md bg-muted-foreground/20 animate-pulse" />
          <div className="h-3 w-1/3 rounded-md bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
