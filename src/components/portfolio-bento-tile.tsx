"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioBentoTileProps {
  /** Tile heading, e.g. "Collections". */
  title: string;
  /** "See all" link target — also the tile's own click-through when there's no in-tile action. */
  href: string;
  /**
   * Grid footprint on a 4-column desktop grid. "large" = 2 cols × 2 rows
   * (the primary, media-forward tile), "half" = 2 cols × 1 row (pairs with
   * another "half" tile to fill a large tile's row), "full" = all 4 columns.
   */
  size?: "large" | "half" | "full";
  /** Single primary in-tile action, rendered top-right of the tile header (e.g. a "List" button). */
  action?: React.ReactNode;
  /** True when this tile's content is empty — renders emptyState instead of children. */
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<PortfolioBentoTileProps["size"]>, string> = {
  large: "md:col-span-2 md:row-span-2",
  half: "md:col-span-2 md:row-span-1",
  full: "md:col-span-4 md:row-span-1",
};

/**
 * A single bento cell on the portfolio landing page: a titled, media-forward
 * preview of one section (Collections, Assets, Tickets & memberships,
 * Activity) expanding into its full subpage via "See all" or the tile's own
 * content links. Pure presentation — content is supplied by the caller.
 */
export function PortfolioBentoTile({
  title,
  href,
  size = "half",
  action,
  isEmpty,
  emptyState,
  children,
  className,
}: PortfolioBentoTileProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card min-w-0 flex flex-col overflow-hidden",
        SIZE_CLASS[size],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            See all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="px-4 pb-4 flex-1 flex flex-col">
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center py-6">
            {emptyState}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
