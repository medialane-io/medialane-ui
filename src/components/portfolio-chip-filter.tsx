"use client";

import Link from "next/link";
import { cn } from "../utils/cn.js";

export interface PortfolioChipFilterOption {
  key: string;
  label: string;

  href?: string;
}

export interface PortfolioChipFilterProps {
  options: PortfolioChipFilterOption[];

  value: string;
  onChange: (key: string) => void;

  showAll?: boolean;
  className?: string;
}

const CHIP_CLASS =
  "shrink-0 rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors border";
const INACTIVE_CLASS = "bg-muted border-border/60 text-muted-foreground hover:text-foreground hover:border-border";
const ACTIVE_CLASS = "bg-gradient-to-r from-brand-purple to-brand-orange border-transparent text-white font-bold";

export function PortfolioChipFilter({
  options,
  value,
  onChange,
  showAll = true,
  className,
}: PortfolioChipFilterProps) {
  const items = showAll ? [{ key: "all", label: "All" }, ...options] : options;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
        className,
      )}
    >
      {items.map((item) =>
        item.href ? (
          <Link
            key={item.key}
            href={item.href}
            className={cn(CHIP_CLASS, item.href === value ? ACTIVE_CLASS : INACTIVE_CLASS)}
          >
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
