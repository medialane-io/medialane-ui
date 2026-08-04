"use client";

import Link from "next/link";
import { cn } from "../utils/cn.js";

export interface PortfolioChipFilterOption {
  key: string;
  label: string;
  /**
   * When set, this chip is a direct navigation link (e.g. "Listings",
   * "Sponsorships") rather than an in-page filter — for portfolio sections
   * that don't have their own bento tile. Never participates in the active
   * filter state.
   */
  href?: string;
}

export interface PortfolioChipFilterProps {
  options: PortfolioChipFilterOption[];
  /** Selected option key, or "all". */
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

const CHIP_CLASS =
  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-colors";
const INACTIVE_CLASS = "bg-muted text-muted-foreground hover:text-foreground";
const ACTIVE_CLASS = "bg-primary text-primary-foreground font-medium";

/**
 * Horizontally-scrollable chip row for fast lateral access across every
 * portfolio section (Instagram/YouTube-style filter chips) — this is the
 * page's sole fast-access mechanism, replacing tab navigation entirely.
 * Filter chips (no `href`) narrow which bento tiles are visible on the same
 * page. Link chips (`href` set) navigate straight to a subpage that has no
 * tile of its own (Listings, Offers, Sponsorships, …).
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
      {items.map((item) =>
        item.href ? (
          <Link key={item.key} href={item.href} className={cn(CHIP_CLASS, INACTIVE_CLASS)}>
            {item.label}
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn(CHIP_CLASS, item.key === value ? ACTIVE_CLASS : INACTIVE_CLASS)}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
