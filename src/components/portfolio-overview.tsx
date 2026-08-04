"use client";

import { useState } from "react";
import { cn } from "../utils/cn.js";
import { PortfolioBentoTile, type PortfolioBentoTileProps } from "./portfolio-bento-tile.js";
import { PortfolioChipFilter } from "./portfolio-chip-filter.js";

export interface PortfolioBentoTileConfig {
  /** Matches a PortfolioChipFilter option key. */
  key: string;
  title: string;
  href: string;
  size?: PortfolioBentoTileProps["size"];
  /** Single primary in-tile action (e.g. a "List" button). */
  action?: React.ReactNode;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
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
 * Portfolio landing page: a content-first bento dashboard. Each tile is a
 * fast preview of one section (Collections, Assets, Tickets & memberships,
 * Activity, …) that expands into its full subpage. A chip row gives fast
 * lateral access across sections without navigating away. Pure
 * presentation — the app supplies each tile's rendered content; this
 * component only handles layout, filtering, and empty states.
 */
export function PortfolioOverview({
  tiles,
  isEmpty,
  emptyState,
  className,
}: PortfolioOverviewProps) {
  const [selected, setSelected] = useState("all");

  if (isEmpty) {
    return <div className={className}>{emptyState}</div>;
  }

  const visibleTiles =
    selected === "all" ? tiles : tiles.filter((t) => t.key === selected);

  return (
    <div className={cn("space-y-6", className)}>
      <PortfolioChipFilter
        options={tiles.map((t) => ({ key: t.key, label: t.title }))}
        value={selected}
        onChange={setSelected}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
        {visibleTiles.map((tile) => (
          <PortfolioBentoTile
            key={tile.key}
            title={tile.title}
            href={tile.href}
            size={tile.size}
            action={tile.action}
            isEmpty={tile.isEmpty}
            emptyState={tile.emptyState}
          >
            {tile.content}
          </PortfolioBentoTile>
        ))}
      </div>
    </div>
  );
}
