"use client";

import Link from "./link.js";
import { useEffect, useState } from "react";
import { useIntersectionActive } from "../utils/use-intersection-active.js";
import { cn } from "../utils/cn.js";
import { AddressDisplay } from "./address-display.js";
import { ParentAttributionBanner } from "./parent-attribution-banner.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { ExpandableText } from "./expandable-text.js";

interface AssetMediaColumnProps {
  image: string | null;
  imageAlt: string;
  imgError: boolean;
  onImageError: () => void;
  onImageLoad?: () => void;
  fallback: React.ReactNode;


  animationUrl?: string | null;

  live?: boolean;
}

export function AssetMediaColumn({
  image,
  imageAlt,
  imgError,
  onImageError,
  onImageLoad,
  fallback,
  animationUrl,
  live = false,
}: AssetMediaColumnProps) {
  const [ref, isVisible] = useIntersectionActive<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [image]);
  const showLive = live && !!animationUrl && isVisible;

  const markLoaded = () => {
    setLoaded(true);
    onImageLoad?.();
  };

  const shimmer = !loaded && (
    <div
      className="absolute inset-0 animate-[shimmer_1.6s_ease-in-out_infinite] bg-foreground/[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, color-mix(in srgb, var(--foreground) 8%, transparent), transparent)",
        backgroundSize: "200% 100%",
      }}
    />
  );

  return (
    <div ref={ref} className="w-full lg:sticky lg:top-16">
      {showLive ? (
        <div className="w-full overflow-hidden rounded-3xl aspect-square">
          <iframe
            src={animationUrl!}
            title={imageAlt}
            sandbox="allow-scripts"
            loading="lazy"
            className="w-full h-full border-0"
          />
        </div>
      ) : !image || imgError ? (
        <div className="w-full overflow-hidden rounded-3xl">{fallback}</div>
      ) : (
        <div className={cn("relative block w-full overflow-hidden rounded-3xl", !loaded && "aspect-square")}>
          {shimmer}
          <img
            ref={(el) => {
              if (!loaded && el?.complete && el.naturalWidth > 0) markLoaded();
            }}
            src={image}
            alt={imageAlt}
            fetchPriority="high"
            decoding="async"
            onLoad={markLoaded}
            onError={onImageError}
            className="relative w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      )}

    </div>
  );
}

interface AssetHeaderBlockProps {
  name: string;
  badges?: React.ReactNode;
  utilities?: React.ReactNode;
  description?: string | null;
  parentContract?: string | null;
  parentTokenId?: string | null;
}

export function AssetHeaderBlock({
  name,
  badges,
  utilities,
  description,
  parentContract,
  parentTokenId,
}: AssetHeaderBlockProps) {
  return (
    <div className="min-w-0 flex-1">
      {badges || utilities ? (
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {badges}
          </div>
          {utilities}
        </div>
      ) : null}
      {parentContract && parentTokenId ? (
        <div className="mb-3">
          <ParentAttributionBanner
            parentContract={parentContract}
            parentTokenId={parentTokenId}
            parentName={`Token #${parentTokenId}`}
          />
        </div>
      ) : null}
      <h1 className="text-2xl lg:text-4xl font-bold break-words">{name}</h1>
      {description ? <ExpandableText text={description} className="mt-1" /> : null}
    </div>
  );
}

export interface AssetOwnerRowProps {
  ownerAddress?: string | null;
  ownerHref?: string;
  ipType?: string | null;
}

export function AssetOwnerRow({ ownerAddress, ownerHref, ipType }: AssetOwnerRowProps) {
  if (!ownerAddress && !ipType) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
      {ipType ? <IpTypeBadge ipType={ipType} size="md" showLabel /> : null}
      {ownerAddress && ownerHref ? (
        <div className="flex items-center gap-1.5">
          <span>Owner</span>
          <Link href={ownerHref} className="hover:text-primary transition-colors font-medium">
            <AddressDisplay address={ownerAddress} />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
