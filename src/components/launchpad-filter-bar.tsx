"use client";

import { Search, X } from "lucide-react";
import { cn } from "../utils/cn.js";
import type { ServiceGroup, ServiceGroupDefinition } from "../data/launchpad-services.js";

export interface LaunchpadFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  groups: ServiceGroupDefinition[];
  activeGroups: Set<ServiceGroup>;
  onToggleGroup: (key: ServiceGroup) => void;
  showComingSoon: boolean;
  onToggleComingSoon: (value: boolean) => void;
  resultCount: number;
}

/**
 * Search + group-filter bar sitting above the grouped launchpad sections.
 * Fully controlled — all state (query, active groups, coming-soon toggle)
 * lives in the caller (`LaunchpadGroupedSections`) so the grid below can
 * react to the same state without prop-drilling through this component.
 */
export function LaunchpadFilterBar({
  query,
  onQueryChange,
  groups,
  activeGroups,
  onToggleGroup,
  showComingSoon,
  onToggleComingSoon,
  resultCount,
}: LaunchpadFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search services"
            className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {groups.map((group) => {
            const active = activeGroups.has(group.key);
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => onToggleGroup(group.key)}
                aria-pressed={active}
                className={cn(
                  "h-8 px-3.5 rounded-full text-xs font-semibold transition-colors border",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border active:bg-muted/60 sm:hover:bg-muted/40",
                )}
              >
                {group.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showComingSoon}
            onChange={(e) => onToggleComingSoon(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border accent-primary"
          />
          Show coming soon
        </label>
        <p className="text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? "service" : "services"}
        </p>
      </div>
    </div>
  );
}
