"use client";

import { cn } from "../utils/cn.js";
import { PortfolioBentoTile, type PortfolioBentoTileProps } from "./portfolio-bento-tile.js";

export interface PortfolioBentoTileConfig {
  key: string;
  title: string;
  href: string;
  size?: PortfolioBentoTileProps["size"];

  isEmpty?: boolean;
  content: React.ReactNode;
}

export interface PortfolioOverviewProps {
  tiles: PortfolioBentoTileConfig[];

  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

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
        // True masonry: a CSS multi-column container. Each tile keeps its
        // own natural height and flows into whichever column is currently
        // shortest — unlike a grid, nothing stretches to match a taller
        // sibling in the same row, which is what real (unevenly-sized)
        // portfolio content needs. "wide" tiles opt out via column-span:
        // all (set on PortfolioBentoTile itself, not here).
        "columns-1 sm:columns-2 lg:columns-3 gap-4",
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
