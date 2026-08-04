"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioBentoTileProps {
  /** Tile heading, e.g. "Collections". */
  title: string;
  /** "See all" link target. */
  href: string;
  /**
   * "wide" spans every grid track (for list-shaped content like Activity).
   * Default sits in one track, sized to its own content — the auto-fit
   * grid stretches it to fill available width when few tiles are present.
   */
  size?: "wide" | "default";
  children: React.ReactNode;
  className?: string;
}

/**
 * A single cell on the portfolio landing page: a titled, media-forward
 * preview of one section, expanding into its full subpage via "See all".
 * Pure presentation — content is supplied by the caller.
 */
export function PortfolioBentoTile({
  title,
  href,
  size = "default",
  children,
  className,
}: PortfolioBentoTileProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/50 bg-card/60 min-w-0",
        size === "wide" && "col-span-full",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          See all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}
