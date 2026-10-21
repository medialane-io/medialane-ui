"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "./badge.js";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";
import { useCollectionFilters, CollectionFiltersTrigger, CollectionFiltersBody } from "./collection-filters.js";
import type { ApiToken, CollectionTokensSort } from "@medialane/sdk";

export interface CollectionFiltersDialogProps {
  tokens: ApiToken[];
  selected: Record<string, string[]>;
  onChange: (filters: Record<string, string[]>) => void;
  sort: CollectionTokensSort;
  onSortChange: (sort: CollectionTokensSort) => void;
  chips?: boolean;
}

export function CollectionFiltersDialog({
  tokens,
  selected,
  onChange,
  sort,
  onSortChange,
  chips = true,
}: CollectionFiltersDialogProps) {
  const [open, setOpen] = useState(false);
  const { traitSections, activeEntries, totalActiveCount, sortIsDefault, toggleValue, clearAll, removeFilter } =
    useCollectionFilters(tokens, selected, onChange, sort, onSortChange);

  return (
    <>
      <CollectionFiltersTrigger
        totalActiveCount={totalActiveCount}
        sortIsDefault={sortIsDefault}
        sort={sort}
        activeEntries={activeEntries}
        onOpen={() => setOpen(true)}
        onSortReset={() => onSortChange("recent")}
        onRemoveFilter={removeFilter}
        onClearAll={clearAll}
        showChips={chips}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-sm p-0 overflow-hidden gap-0 flex flex-col max-h-[85svh]">

          <div className="flex items-center justify-between pr-10 pl-5 py-4 border-b border-border/60 shrink-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {totalActiveCount > 0 && (
                <Badge variant="secondary" className="text-[11px] font-medium">
                  {totalActiveCount} active
                </Badge>
              )}
            </DialogTitle>
            {totalActiveCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <CollectionFiltersBody
            sort={sort}
            onSortChange={onSortChange}
            traitSections={traitSections}
            selected={selected}
            onToggleValue={toggleValue}
          />

          <div className="px-5 pt-3 pb-5 border-t border-border/60 shrink-0">
            <button
              className="w-full h-11 rounded-[11px] bg-brand-purple text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
              onClick={() => setOpen(false)}
            >
              {totalActiveCount > 0
                ? `Show results (${totalActiveCount} filter${totalActiveCount > 1 ? "s" : ""})`
                : "Close"}
            </button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}

export function CollectionActiveFilters({ tokens, selected, onChange, sort, onSortChange }: Omit<CollectionFiltersDialogProps, "chips">) {
  const { activeEntries, totalActiveCount, sortIsDefault, clearAll, removeFilter } =
    useCollectionFilters(tokens, selected, onChange, sort, onSortChange);
  return (
    <CollectionFiltersTrigger
      totalActiveCount={totalActiveCount}
      sortIsDefault={sortIsDefault}
      sort={sort}
      activeEntries={activeEntries}
      onOpen={() => {}}
      onSortReset={() => onSortChange("recent")}
      onRemoveFilter={removeFilter}
      onClearAll={clearAll}
      showButton={false}
    />
  );
}
