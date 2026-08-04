"use client";

import { cn } from "../utils/cn.js";
import { PortfolioBentoTile, type PortfolioBentoTileProps } from "./portfolio-bento-tile.js";

export interface PortfolioBentoTileConfig {
  key: string;
  title: string;
  href: string;
  size?: PortfolioBentoTileProps["size"];
  /** Tiles with nothing to show are omitted entirely, not rendered empty. */
  isEmpty?: boolean;
  content: React.ReactNode;
}

export interface PortfolioOverviewProps {
  tiles: PortfolioBentoTileConfig[];
  /** First-run state across the whole portfolio (zero holdings, zero activity). */
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * Portfolio landing page: a content-first dashboard. Each tile is a fast
 * preview of one section, expanding into its full subpage via "See all".
 * Navigation across portfolio sections lives one level up, in the shared
 * portfolio chip bar rendered by the app's layout on every page — this
 * component is pure tile layout, nothing else.
 *
 * Uses a CSS grid with `auto-fit` tracks rather than multi-column masonry:
 * masonry's fixed column tracks leave dead blank space when few tiles are
 * populated (a real, reproduced failure mode with sparse content). `auto-fit`
 * collapses empty tracks and stretches present tiles to fill the freed
 * width, so the layout always uses the full screen regardless of how many
 * tiles are populated. `items-start` overrides grid's default row-stretch —
 * without it, a short tile sharing a row with a tall one gets stretched to
 * match, leaving dead space inside its own card (also reproduced).
 */
export function PortfolioOverview({
  tiles,
  isEmpty,
  emptyState,
  className,
}: PortfolioOverviewProps) {
  if (isEmpty) {
    return <div className={className}>{emptyState}</div>;
  }

  const populatedTiles = tiles.filter((t) => !t.isEmpty);

  return (
    <div
      className={cn(
        "grid gap-4 items-start grid-cols-[repeat(auto-fit,minmax(320px,1fr))]",
        className,
      )}
    >
      {populatedTiles.map((tile) => (
        <PortfolioBentoTile
          key={tile.key}
          title={tile.title}
          href={tile.href}
          size={tile.size}
        >
          {tile.content}
        </PortfolioBentoTile>
      ))}
    </div>
  );
}
