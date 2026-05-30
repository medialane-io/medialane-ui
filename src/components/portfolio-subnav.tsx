"use client";

import Link from "next/link";
import { cn } from "../utils/cn.js";

export type PortfolioBadgeVariant = "destructive" | "primary" | "warning";

export interface PortfolioNavItem {
  label: string;
  href: string;
  /** Optional count badge. `key` indexes `badgeCounts`; `variant` sets color. */
  badge?: { key: string; variant?: PortfolioBadgeVariant };
}

export interface PortfolioNavGroup {
  label: string;
  items: PortfolioNavItem[];
}

export interface PortfolioSubnavProps {
  groups: PortfolioNavGroup[];
  /** Current pathname — caller passes `usePathname()`. */
  pathname: string;
  /** Badge counts keyed by `item.badge.key`. A badge renders only when > 0. */
  badgeCounts?: Record<string, number>;
  className?: string;
}

const BADGE_VARIANT_CLASS: Record<PortfolioBadgeVariant, string> = {
  destructive: "bg-destructive text-destructive-foreground",
  primary: "bg-primary text-primary-foreground",
  warning: "bg-amber-500 text-white",
};

export function PortfolioSubnav({
  groups,
  pathname,
  badgeCounts = {},
  className,
}: PortfolioSubnavProps) {
  return (
    <nav
      className={cn(
        "overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/60",
        className,
      )}
    >
      <div className="flex items-center min-w-max gap-0">
        {groups.map((group, groupIndex) => (
          <div key={group.label} className="flex items-center">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const count = item.badge ? badgeCounts[item.badge.key] ?? 0 : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap transition-colors shrink-0 border-b-2 min-h-10",
                    active
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  {item.badge && count > 0 && (
                    <span
                      className={cn(
                        "h-4 min-w-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1",
                        BADGE_VARIANT_CLASS[item.badge.variant ?? "primary"],
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
            {groupIndex < groups.length - 1 && (
              <span className="w-px h-4 bg-border/40 mx-1 self-center shrink-0" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
