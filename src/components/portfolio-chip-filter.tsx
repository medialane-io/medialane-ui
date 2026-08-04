"use client";

import { cn } from "../utils/cn.js";

export interface PortfolioChipFilterOption {
  key: string;
  label: string;
}

export interface PortfolioChipFilterProps {
  options: PortfolioChipFilterOption[];
  /** Selected option key, or "all". */
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Horizontally-scrollable chip row for fast lateral access across portfolio
 * sections (Instagram/YouTube-style filter chips) — narrows which bento
 * tiles are visible on the same page, never navigates to a different route.
 */
export function PortfolioChipFilter({
  options,
  value,
  onChange,
  className,
}: PortfolioChipFilterProps) {
  const all: PortfolioChipFilterOption = { key: "all", label: "All" };
  const items = [all, ...options];

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-colors",
              active
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
