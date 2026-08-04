"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useIntersectionActive } from "../utils/use-intersection-active.js";
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
  /** Opens the full-screen lightbox. Omit for a non-interactive (still borderless, real-aspect-ratio) render. */
  onZoom?: () => void;
  /** Resolved animation_url — the live on-chain renderer, if any. */
  animationUrl?: string | null;
  /** Caller-computed eligibility for the living-render treatment. */
  live?: boolean;
  stats?: Array<{
    value: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

/**
 * The platform's one asset media column — borderless, respects the work's
 * real aspect ratio (never forced 1:1), capped to the viewport so it always
 * fits on screen, optional click-to-zoom (foundations §III: image leads, no
 * border clutter).
 *
 * `live`-eligible tokens (a small partner allowlist, see
 * living-render-collections) swap the static image for a sandboxed iframe of
 * the token's own on-chain animation_url once the media scrolls into view —
 * see medialane-core/docs/specs/2026-07-28-gol-starknet-living-render-design.md.
 */
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
  const showLive = live && !!animationUrl && isVisible;

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
          className="group block w-full overflow-hidden rounded-3xl cursor-zoom-in focus:outline-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            crossOrigin="anonymous"
            onError={onImageError}
            className="w-full h-auto max-h-[80vh] object-contain
                       transition duration-300 group-hover:opacity-95 group-active:scale-[0.99]"
          />
        </motion.button>
      ) : (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="block w-full overflow-hidden rounded-3xl"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            crossOrigin="anonymous"
            onError={onImageError}
            className="w-full h-auto max-h-[80vh] object-contain"
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
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-500">
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

/** Single-owner identity (ERC-721) — its own sibling row, not nested inside
 *  the collection bar (that reads as if ownership were a collection
 *  attribute, 2026-07-05 feedback). ERC-1155 editions use `AssetOwnersPanel`
 *  instead (multiple owners). */
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
