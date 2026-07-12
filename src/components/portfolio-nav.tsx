"use client";

import Link from "next/link";
import { cn } from "../utils/cn.js";

export type PortfolioBadgeVariant = "destructive" | "primary" | "warning";

export interface PortfolioNavChild {
  label: string;
  href: string;
  /** Optional count badge. `key` indexes `badgeCounts`; `variant` sets color. */
  badge?: { key: string; variant?: PortfolioBadgeVariant };
}

export interface PortfolioNavSection {
  label: string;
  /** Where the top-level tab links. For sections with children this is the first child. */
  href: string;
  /** Inner segments rendered as a pill row when the section is active. */
  children?: PortfolioNavChild[];
}

export interface PortfolioNavProps {
  sections: PortfolioNavSection[];
  /** Current pathname — caller passes `usePathname()`. */
  pathname: string;
  /** Badge counts keyed by `child.badge.key`. A badge renders only when > 0. */
  badgeCounts?: Record<string, number>;
  className?: string;
}

const BADGE_VARIANT_CLASS: Record<PortfolioBadgeVariant, string> = {
  destructive: "bg-destructive text-destructive-foreground",
  primary: "bg-primary text-primary-foreground",
  warning: "bg-amber-500 text-white",
};

function CountBadge({
  count,
  variant,
}: {
  count: number;
  variant?: PortfolioBadgeVariant;
}) {
  return (
    <span
      className={cn(
        "h-4 min-w-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1",
        BADGE_VARIANT_CLASS[variant ?? "primary"],
      )}
    >
      {count}
    </span>
  );
}

function matches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Two-level portfolio navigation: top-level underline tabs + a segmented pill
 * row when the active section has children. The active section is resolved by
 * the longest href match across section hrefs and child hrefs, so a root
 * "Overview" section (`/portfolio`) doesn't swallow every route.
 */
export function PortfolioNav({
  sections,
  pathname,
  badgeCounts = {},
  className,
}: PortfolioNavProps) {
  const count = (badge?: { key: string }) =>
    badge ? (badgeCounts[badge.key] ?? 0) : 0;

  // Longest-match resolution of the active section.
  let activeSection: PortfolioNavSection | null = null;
  let bestLen = -1;
  for (const section of sections) {
    const hrefs = [section.href, ...(section.children ?? []).map((c) => c.href)];
    for (const href of hrefs) {
      if (matches(pathname, href) && href.length > bestLen) {
        bestLen = href.length;
        activeSection = section;
      }
    }
  }

  const edgeBleed =
    "overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8";

  return (
    <div className={className}>
      <nav className={cn(edgeBleed, "border-b border-border/60")}>
        <div className="flex items-center min-w-max">
          {sections.map((section) => {
            const active = section === activeSection;
            // Rolled-up pending count across the section's children.
            const rollup = (section.children ?? []).reduce(
              (sum, child) => sum + count(child.badge),
              0,
            );
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap transition-colors shrink-0 border-b-2 min-h-10",
                  active
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {section.label}
                {rollup > 0 && !active && (
                  <CountBadge count={rollup} variant="destructive" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      {activeSection?.children && activeSection.children.length > 0 && (
        <nav className={cn(edgeBleed, "pt-3")}>
          <div className="flex items-center min-w-max gap-1.5">
            {activeSection.children.map((child) => {
              const active = matches(pathname, child.href);
              const childCount = count(child.badge);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-colors shrink-0",
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {child.label}
                  {child.badge && childCount > 0 && (
                    <CountBadge count={childCount} variant={child.badge.variant} />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
