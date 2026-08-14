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
