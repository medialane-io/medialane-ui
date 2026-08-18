"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIntersectionActive } from "../utils/use-intersection-active.js";
import { cn } from "../utils/cn.js";
import { AddressDisplay } from "./address-display.js";
import { ParentAttributionBanner } from "./parent-attribution-banner.js";
import { IpTypeBadge } from "./ip-type-badge.js";
import { Layers, Users } from "lucide-react";

interface AssetMediaColumnProps {
  shouldReduce: boolean;
  image: string | null;
  imageAlt: string;
  imgError: boolean;
  onImageError: () => void;
  fallback: React.ReactNode;

  onZoom?: () => void;

  animationUrl?: string | null;

  live?: boolean;
  stats?: Array<{
    value: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

export function AssetMediaColumn({
  shouldReduce,
  image,
  imageAlt,
  imgError,
  onImageError,
  fallback,
  onZoom,
  animationUrl,
  live = false,
  stats,
}: AssetMediaColumnProps) {
  const [ref, isVisible] = useIntersectionActive<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(false), [image]);
  const showLive = live && !!animationUrl && isVisible;

  const shimmer = !loaded && (
    <div
      className="absolute inset-0 min-h-80 animate-[shimmer_1.6s_ease-in-out_infinite] bg-foreground/[0.06]"
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
      ) : onZoom ? (
        <motion.button
          type="button"
          onClick={onZoom}
          aria-label="View full image"
          initial={shouldReduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="group relative block w-full overflow-hidden rounded-3xl cursor-zoom-in focus:outline-none"
        >
          {shimmer}
          <img
            src={image}
            alt={imageAlt}
            crossOrigin="anonymous"
            onLoad={() => setLoaded(true)}
            onError={onImageError}
            className={cn(
              "w-full h-auto max-h-[80vh] object-contain",
              "transition-opacity duration-300 group-hover:opacity-95 group-active:scale-[0.99]",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        </motion.button>
      ) : (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative block w-full overflow-hidden rounded-3xl"
        >
          {shimmer}
          <img
            src={image}
            alt={imageAlt}
            crossOrigin="anonymous"
            onLoad={() => setLoaded(true)}
            onError={onImageError}
            className={cn(
              "w-full h-auto max-h-[80vh] object-contain transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
          />
        </motion.div>
      )}

      {stats && stats.length > 0 ? (
        <div className={`grid gap-3 mt-4 ${stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4 text-center">
              <p className="text-2xl font-black">{stat.value}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                {stat.icon}
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface AssetHeaderBlockProps {
  name: string;
  description?: string | null;
  ipType?: string | null;
  showMultiEditionBadge?: boolean;
  parentContract?: string | null;
  parentTokenId?: string | null;
}

export function AssetHeaderBlock({
  name,
  description,
  ipType,
  showMultiEditionBadge = false,
  parentContract,
  parentTokenId,
}: AssetHeaderBlockProps) {
  return (
    <div className="min-w-0 flex-1">
      {ipType || showMultiEditionBadge ? (
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {ipType ? <IpTypeBadge ipType={ipType} size="md" /> : null}
          {showMultiEditionBadge ? (
            <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-500">
              <Layers className="h-3 w-3" />
              Multi-edition
            </span>
          ) : null}
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
      {description ? (
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
      ) : null}
    </div>
  );
}

export interface AssetOwnerRowProps {
  ownerAddress: string;
  ownerHref: string;
}

export function AssetOwnerRow({ ownerAddress, ownerHref }: AssetOwnerRowProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>Owner</span>
      <Link href={ownerHref} className="hover:text-primary transition-colors font-medium">
        <AddressDisplay address={ownerAddress} />
      </Link>
    </div>
  );
}

export function buildEditionStats(totalEditions: number, uniqueOwners: number) {
  return [
    {
      value: totalEditions.toLocaleString(),
      label: "editions minted",
      icon: <Layers className="h-3 w-3" />,
    },
    {
      value: uniqueOwners.toLocaleString(),
      label: "unique owners",
      icon: <Users className="h-3 w-3" />,
    },
  ];
}
