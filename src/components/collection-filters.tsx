"use client";

import { useMemo } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { cn } from "../utils/cn.js";
import type { ApiToken, CollectionTokensSort } from "@medialane/sdk";

// Trait types that are per-token stamps rather than real categories — never
// useful as a filter regardless of how many distinct values they have.
// "Registration" is the Berne Convention registration date, near-unique per
// mint; filtering by an exact date isn't a meaningful narrowing action.
const EXCLUDED_TRAIT_TYPES = new Set(["registration"]);

export const SORT_OPTIONS: { value: CollectionTokensSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
];

export interface TraitSection {
  traitType: string;
  values: { value: string; count: number }[];
}

export function useCollectionFilters(
  tokens: ApiToken[],
  selected: Record<string, string[]>,
  onChange: (filters: Record<string, string[]>) => void,
  sort: CollectionTokensSort,
  onSortChange: (sort: CollectionTokensSort) => void,
) {
  // Build trait map with value counts from loaded tokens, then drop any
  // trait type where every token shares the same single value (can never
  // narrow the result set) or that's a known per-token stamp, not a category.
  const traitSections: TraitSection[] = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const token of tokens) {
      const attrs = Array.isArray(token.metadata?.attributes)
        ? (token.metadata.attributes as { trait_type?: string; value?: string }[])
        : [];
      for (const attr of attrs) {
        if (!attr.trait_type || attr.value == null) continue;
        if (EXCLUDED_TRAIT_TYPES.has(attr.trait_type.toLowerCase())) continue;
        if (!map.has(attr.trait_type)) map.set(attr.trait_type, new Map());
        const counts = map.get(attr.trait_type)!;
        const v = String(attr.value);
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([traitType, counts]) => ({
        traitType,
        values: Array.from(counts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
      }))
      .filter((section) => section.values.length >= 2);
  }, [tokens]);

  const activeEntries = Object.entries(selected).flatMap(([traitType, values]) =>
    values.map((value) => ({ traitType, value }))
  );
  const traitActiveCount = activeEntries.length;
  const sortIsDefault = sort === "recent";
  const totalActiveCount = traitActiveCount + (sortIsDefault ? 0 : 1);

  function toggleValue(traitType: string, value: string) {
    const current = selected[traitType] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const nextSelected = { ...selected };
    if (next.length === 0) {
      delete nextSelected[traitType];
    } else {
      nextSelected[traitType] = next;
    }
    onChange(nextSelected);
  }

  function clearAll() {
    onChange({});
    onSortChange("recent");
  }

  function removeFilter(traitType: string, value: string) {
    toggleValue(traitType, value);
  }

  return { traitSections, activeEntries, totalActiveCount, sortIsDefault, toggleValue, clearAll, removeFilter };
}

const TRIGGER_BTN = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3 shrink-0";

export interface CollectionFiltersTriggerProps {
  totalActiveCount: number;
  sortIsDefault: boolean;
  sort: CollectionTokensSort;
  activeEntries: { traitType: string; value: string }[];
  onOpen: () => void;
  onSortReset: () => void;
  onRemoveFilter: (traitType: string, value: string) => void;
  onClearAll: () => void;
}

export function CollectionFiltersTrigger({
  totalActiveCount,
  sortIsDefault,
  sort,
  activeEntries,
  onOpen,
  onSortReset,
  onRemoveFilter,
  onClearAll,
}: CollectionFiltersTriggerProps) {
  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <button onClick={onOpen} className={TRIGGER_BTN}>
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {totalActiveCount > 0 && (
          <span className="h-4 min-w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center px-1 -mr-1">
            {totalActiveCount}
          </span>
        )}
      </button>

      {/* Sort pill — only shown when not the default */}
      {!sortIsDefault && (
        <button
          onClick={onSortReset}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-primary/40 bg-primary/10 text-xs font-medium text-foreground hover:bg-primary/20 transition-colors"
        >
          <span className="text-muted-foreground text-[11px]">Sort:</span>
          <span>{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
          <X className="h-3 w-3 text-muted-foreground ml-0.5" />
        </button>
      )}

      {/* Active trait pills — one per selected value */}
      {activeEntries.map(({ traitType, value }) => (
        <button
          key={`${traitType}:${value}`}
          onClick={() => onRemoveFilter(traitType, value)}
          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-primary/40 bg-primary/10 text-xs font-medium text-foreground hover:bg-primary/20 transition-colors"
        >
          <span className="text-muted-foreground text-[11px]">{traitType}:</span>
          <span>{value}</span>
          <X className="h-3 w-3 text-muted-foreground ml-0.5" />
        </button>
      ))}

      {totalActiveCount > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export interface CollectionFiltersBodyProps {
  sort: CollectionTokensSort;
  onSortChange: (sort: CollectionTokensSort) => void;
  traitSections: TraitSection[];
  selected: Record<string, string[]>;
  onToggleValue: (traitType: string, value: string) => void;
}

const PILL_BASE = "inline-flex items-center gap-1 h-7 px-2.5 rounded-full border text-[12px] font-medium transition-colors";
const PILL_ON = "border-primary bg-primary text-primary-foreground";
const PILL_OFF = "border-border bg-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30";

export function CollectionFiltersBody({
  sort,
  onSortChange,
  traitSections,
  selected,
  onToggleValue,
}: CollectionFiltersBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
      {/* Sort section */}
      <div>
        <div className="mb-2">
          <span className="text-sm font-medium">Sort by</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map(({ value, label }) => {
            const isSelected = sort === value;
            return (
              <button
                key={value}
                onClick={() => onSortChange(value)}
                className={cn(PILL_BASE, isSelected ? PILL_ON : PILL_OFF)}
              >
                {isSelected && <Check className="h-3 w-3" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trait sections — always expanded (pruning already removed the noise) */}
      {traitSections.length > 0 && (
        <>
          <div className="h-px w-full bg-border" />
          {traitSections.map((section, i) => {
            const activeValues = selected[section.traitType] ?? [];
            return (
              <div key={section.traitType}>
                {i > 0 && <div className="h-px w-full bg-border mb-4" />}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{section.traitType}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {section.values.length} values
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {section.values.map(({ value, count }) => {
                    const isSelected = activeValues.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => onToggleValue(section.traitType, value)}
                        className={cn(PILL_BASE, isSelected ? PILL_ON : PILL_OFF)}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        <span>{value}</span>
                        <span className={isSelected ? "opacity-80" : "opacity-60"}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
