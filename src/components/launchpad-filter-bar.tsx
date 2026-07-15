"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../utils/cn.js";
import { serviceMatchesQuery } from "./launchpad-services.js";
import {
  LAUNCHPAD_SERVICE_DEFINITIONS,
  type ServiceGroup,
  type ServiceGroupDefinition,
} from "../data/launchpad-services.js";

export interface LaunchpadFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  groups: ServiceGroupDefinition[];
  activeGroups: Set<ServiceGroup>;
  onToggleGroup: (key: ServiceGroup) => void;
  /** Accepted for API stability; the bar no longer renders a total count. */
  resultCount?: number;
}

/**
 * Search + group-filter bar above the launchpad grid. Fully controlled — all
 * state (query, active groups) lives in the caller so the grid below reacts
 * to the same state. Each pill shows the live count of services it matches
 * under the current search query. Pressing "/" anywhere on the page focuses
 * the search input.
 */
export function LaunchpadFilterBar({
  query,
  onQueryChange,
  groups,
  activeGroups,
  onToggleGroup,
}: LaunchpadFilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const countFor = (key: ServiceGroup) =>
    LAUNCHPAD_SERVICE_DEFINITIONS.filter(
      (d) => d.group === key && d.status === "live" && serviceMatchesQuery(d, query),
    ).length;

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search services"
          className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple/40"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-5 w-5 items-center justify-center rounded border border-border bg-muted/40 text-[11px] font-medium text-muted-foreground pointer-events-none">
            /
          </kbd>
        )}
      </div>

      <div className="flex flex-wrap gap-2 flex-1">
        {groups.map((group) => {
          const active = activeGroups.has(group.key);
          const count = countFor(group.key);
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => onToggleGroup(group.key)}
              aria-pressed={active}
              className={cn(
                "h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border inline-flex items-center gap-1.5",
                active
                  ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white border-transparent shadow-sm"
                  : "bg-card text-muted-foreground border-border active:bg-muted/60 sm:hover:bg-muted/40",
              )}
            >
              {group.title}
              <span className={cn("tabular-nums", active ? "text-white/70" : "text-muted-foreground/60")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
