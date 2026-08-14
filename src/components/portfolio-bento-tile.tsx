"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioBentoTileProps {

  title: string;

  href: string;

  /** Cell footprint in the bento-masonry grid (see PortfolioOverview):
   * "default" = 1x1, "wide" = 2x1 (list-like content), "large" = 2x2 (the
   * hero tile — the grid is sized so exactly one "large" tile per screen
   * packs edge-to-edge with the rest, no gaps). */
  size?: "default" | "wide" | "large";
  children: React.ReactNode;
  className?: string;
}

const SIZE_SPAN: Record<NonNullable<PortfolioBentoTileProps["size"]>, string> = {
  default: "",
  wide: "sm:col-span-2",
  large: "sm:col-span-2 sm:row-span-2",
};

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
        "rounded-2xl bg-foreground/[0.04] min-w-0 flex flex-col transition-colors hover:bg-foreground/[0.07]",
        SIZE_SPAN[size],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <h2 className="text-sm font-black text-foreground tracking-tight">
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
      <div className="px-4 pb-4 flex-1 min-h-0">{children}</div>
    </section>
  );
}
