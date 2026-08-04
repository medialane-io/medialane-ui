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
  /** Tiles with nothing to show are omitted entirely, not rendered empty. */
  isEmpty?: boolean;
  content: React.ReactNode;
}

export interface PortfolioOverviewLink {
  label: string;
  href: string;
}

export interface PortfolioOverviewProps {
  tiles: PortfolioBentoTileConfig[];
  /**
   * Extra chip-bar entries that navigate straight to a subpage with no
   * bento tile of its own (Listings, Offers, Sponsorships, …) — this is how
   * every portfolio section stays reachable now that there's no tab bar.
   */
  links?: PortfolioOverviewLink[];
  /** First-run state across the whole portfolio (zero holdings, zero activity). */
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * Portfolio landing page: a content-first masonry dashboard. Each tile is a
 * fast preview of one section that expands into its full subpage. A chip
 * row gives fast lateral access across every portfolio destination — both
 * in-page filters (tiles) and direct links to sections with no tile of
 * their own. Pure presentation — the app supplies each tile's rendered
 * content; this component only handles layout, filtering, and hiding empty
 * tiles.
 */
export function PortfolioOverview({
  tiles,
  links = [],
  isEmpty,
  emptyState,
  className,
}: PortfolioOverviewProps) {
  const [selected, setSelected] = useState("all");

  if (isEmpty) {
    return <div className={className}>{emptyState}</div>;
  }

  const populatedTiles = tiles.filter((t) => !t.isEmpty);
  const visibleTiles =
    selected === "all" ? populatedTiles : populatedTiles.filter((t) => t.key === selected);

  return (
    <div className={cn("space-y-6", className)}>
      <PortfolioChipFilter
        options={[
          ...populatedTiles.map((t) => ({ key: t.key, label: t.title })),
          ...links.map((l) => ({ key: l.href, label: l.label, href: l.href })),
        ]}
        value={selected}
        onChange={setSelected}
      />
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4">
        {visibleTiles.map((tile) => (
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
    </div>
  );
}
