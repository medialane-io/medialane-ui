"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioBentoTileProps {
  /** Tile heading, e.g. "Collections". */
  title: string;
  /** "See all" link target — also the tile's own click-through when there's no in-tile action. */
  href: string;
  /** Grid footprint. "wide" = full row, "tall" = 2 rows media-forward, "compact" = quarter width. */
  size?: "wide" | "tall" | "compact";
  /** Single primary in-tile action, rendered top-right of the tile header (e.g. a "List" button). */
  action?: React.ReactNode;
  /** True when this tile's content is empty — renders emptyState instead of children. */
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<PortfolioBentoTileProps["size"]>, string> = {
  wide: "md:col-span-4 md:row-span-1",
  tall: "md:col-span-2 md:row-span-2",
  compact: "md:col-span-2 md:row-span-1",
};

/**
 * A single bento cell on the portfolio landing page: a titled, media-forward
 * preview of one section (Collections, Assets, Tickets & memberships,
 * Activity) with an optional single primary action, expanding into its full
 * subpage via "See all" or the tile's own content links. Pure presentation —
 * content is supplied by the caller as children.
 */
export function PortfolioBentoTile({
  title,
  href,
  size = "compact",
  action,
  isEmpty,
  emptyState,
  children,
  className,
}: PortfolioBentoTileProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 space-y-3 min-w-0",
        SIZE_CLASS[size],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
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
      {isEmpty ? emptyState : children}
    </section>
  );
}
