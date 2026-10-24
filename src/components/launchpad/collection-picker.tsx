"use client";

import { useState } from "react";
import { Boxes, Check, ChevronDown, Plus } from "lucide-react";
import type { ApiCollection } from "@medialane/sdk";
import Image from "../image.js";
import Link from "../link.js";
import { Input } from "../input.js";
import { Skeleton } from "../skeleton.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { cn } from "../../utils/cn.js";
import { useImageUrl } from "../../utils/use-image-url.js";

export interface CollectionPickerProps {
  collections: ApiCollection[];
  loading: boolean;
  value: string;
  onChange: (id: string) => void;
  newCollectionHref: string;
}

function label(col: ApiCollection) {
  return col.name || col.symbol || `Collection #${col.collectionId}`;
}

function works(col: ApiCollection) {
  return col.totalSupply != null ? `${col.totalSupply.toLocaleString()} work${col.totalSupply !== 1 ? "s" : ""}` : "Empty";
}

function Thumb({ image, size }: { image: string | null | undefined; size: "sm" | "md" }) {
  const url = useImageUrl()(image);
  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-muted shrink-0", size === "md" ? "h-10 w-10" : "h-8 w-8")}>
      {url ? (
        <Image src={url} alt="" fill unoptimized className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Boxes className="h-4 w-4 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

export function CollectionPicker({ collections, loading, value, onChange, newCollectionHref }: CollectionPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  if (loading) return <Skeleton className="h-[4.25rem] rounded-xl" />;

  if (collections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-5 text-center space-y-3">
        <p className="text-sm text-muted-foreground">You don&apos;t have a collection yet — every work needs one to live in.</p>
        <Link
          href={newCollectionHref}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:brightness-110 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Create your first collection
        </Link>
      </div>
    );
  }

  const selected = collections.find((c) => c.collectionId === value) ?? null;
  const filtered = query.trim() ? collections.filter((c) => label(c).toLowerCase().includes(query.trim().toLowerCase())) : collections;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/40"
        >
          <Thumb image={selected?.image} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{selected ? label(selected) : "Choose a collection"}</p>
            <p className="text-xs text-muted-foreground">{selected ? works(selected) : "Where this work will live"}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0">
            Change
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {collections.length > 5 && (
          <div className="border-b border-border p-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search collections…" className="h-8" />
          </div>
        )}
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">No collection found.</p>
          ) : (
            filtered.map((col) => (
              <button
                key={col.collectionId!}
                type="button"
                onClick={() => {
                  onChange(col.collectionId!);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
              >
                <Thumb image={col.image} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{label(col)}</p>
                  <p className="text-xs text-muted-foreground">{works(col)}</p>
                </div>
                {value === col.collectionId && <Check className="h-4 w-4 text-brand-blue shrink-0" />}
              </button>
            ))
          )}
        </div>
        <div className="border-t border-border p-1">
          <Link
            href={newCollectionHref}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            New collection
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
