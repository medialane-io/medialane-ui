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
        // Bento-masonry: a fixed 3-column grid (not auto-fit) so each
        // tile's declared col/row span composes into a gapless pack via
        // `dense` auto-flow — auto-fit's variable column count can't
        // support that. Row height is fixed so a "large" (2x2) tile lines
        // up exactly with two stacked "default" (1x1) tiles beside it.
        "grid gap-4 grid-flow-dense auto-rows-[minmax(220px,auto)] grid-cols-1 sm:grid-cols-3",
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
