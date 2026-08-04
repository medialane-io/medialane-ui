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
 * Portfolio landing page: a content-first masonry dashboard. Each tile is a
 * fast preview of one section, expanding into its full subpage via "See
 * all". Navigation across portfolio sections lives one level up, in the
 * shared portfolio chip bar rendered by the app's layout on every page —
 * this component is pure tile layout, nothing else.
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
    <div className={cn("columns-1 md:columns-2 xl:columns-3 gap-4", className)}>
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
