"use client";

import Link from "./link.js";
import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn.js";

export type PortfolioSectionColor =
  | "blue"
  | "purple"
  | "rose"
  | "orange"
  | "maeve"
  | "navy";

const BORDER_BY_COLOR: Record<PortfolioSectionColor, string> = {
  blue: "border-brand-blue/40",
  purple: "border-brand-purple/40",
  rose: "border-brand-rose/40",
  orange: "border-brand-orange/40",
  maeve: "border-brand-maeve/40",
  navy: "border-brand-navy/40",
};

export interface PortfolioSectionProps {
  title: string;
  href: string;

  /** Which brand color accents this section's hairline border. */
  color?: PortfolioSectionColor;

  /** "default" sits in the grid alongside its siblings; "wide" spans the
   * full row instead — for list-like content (e.g. Activity) that reads
   * better edge-to-edge than column-width. */
  size?: "default" | "wide";
  children: React.ReactNode;
  className?: string;
}

export function PortfolioSection({
  title,
  href,
  color = "purple",
  size = "default",
  children,
  className,
}: PortfolioSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border min-w-0",
        BORDER_BY_COLOR[color],
        size === "wide" && "sm:col-span-2 lg:col-span-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
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
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}
