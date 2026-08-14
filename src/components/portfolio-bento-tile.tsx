"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface PortfolioBentoTileProps {

  title: string;

  href: string;

  /** "default" flows into whichever column is currently shortest (true
   * masonry, via PortfolioOverview's CSS multi-column container) — each
   * tile keeps its own natural height, nothing stretches to match a
   * sibling. "wide" breaks out to full width instead (list-like content
   * such as Activity, which reads better edge-to-edge than column-width). */
  size?: "default" | "wide";
  children: React.ReactNode;
  className?: string;
}

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
        "rounded-2xl bg-foreground/[0.04] min-w-0 transition-colors hover:bg-foreground/[0.07]",
        "mb-4 break-inside-avoid",
        size === "wide" && "[column-span:all]",
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
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}
