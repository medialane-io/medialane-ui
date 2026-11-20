"use client";

import { useState } from "react";
import Image from "next/image";
import type { ApiCollection } from "@medialane/sdk";
import { Boxes, Check, ChevronDown, Plus } from "lucide-react";
import { Input } from "../input.js";
import { Textarea } from "../textarea.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import { cn } from "../../utils/cn.js";
import { useImageUrl } from "../../utils/use-image-url.js";
import type { useNewCollectionDraft } from "./use-new-collection-draft.js";
import { useT } from "../../i18n/provider.js";

function collectionDisplayLabel(col: ApiCollection) {
  return col.name || col.symbol || `Collection #${col.collectionId}`;
}

function CollectionThumb({ image }: { image: string | null | undefined }) {
  const resolveImage = useImageUrl();
  const imageUrl = resolveImage(image);
  return (
    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Boxes className="h-4 w-4 text-muted-foreground/40" />
        </div>
      )}
    </div>
  );
}

export function CollectionPicker({
  collections, value, onChange, valueOf,
}: {
  collections: ApiCollection[];
  value: string;
  onChange: (id: string) => void;
  valueOf: (c: ApiCollection) => string | null | undefined;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const selected = value
    ? collections.find((c) => valueOf(c) === value) ?? null
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          className="panel flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/40"
        >
          <CollectionThumb image={selected?.image} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">
              {selected ? collectionDisplayLabel(selected) : collections.length ? t("Choose a collection") : t("No collections yet")}
            </p>
            <p className="text-xs text-muted-foreground">
              {selected ? `${selected.totalSupply ?? 0} work${selected.totalSupply === 1 ? "" : "s"}` : t("Where this work will live")}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-64 overflow-y-auto p-1">
          {collections.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">{t("No collections yet — create one instead.")}</p>
          ) : (
            collections.map((col) => {
              const id = valueOf(col);
              const isSelected = !!id && value === id;
              return (
                <button
                  key={id ?? col.contractAddress ?? col.name}
                  type="button"
                  disabled={!id}
                  onClick={() => { if (!id) return; onChange(id); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                >
                  <CollectionThumb image={col.image} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{collectionDisplayLabel(col)}</p>
                    <p className="text-xs text-muted-foreground">{t.plural("{count} work", "{count} works", col.totalSupply ?? 0)}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand-blue shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


export type CollectionMode = "existing" | "new";

export function CollectionSection({
  mode, onModeChange, collections, value, onValue, valueOf, draft, previewImage, noun = "collection",
}: {
  mode: CollectionMode;
  onModeChange: (mode: CollectionMode) => void;
  collections: ApiCollection[];
  value: string;
  onValue: (value: string) => void;
  valueOf: (c: ApiCollection) => string | null | undefined;
  draft: ReturnType<typeof useNewCollectionDraft>;
  previewImage: string | null;
  noun?: string;
}) {
  const t = useT();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Boxes className="h-4 w-4" />
          {noun.charAt(0).toUpperCase() + noun.slice(1)} *
        </label>
        <div className="flex rounded-lg overflow-hidden bg-muted/40">
          <button
            type="button"
            onClick={() => onModeChange("existing")}
            className={cn("px-3 h-7 text-xs font-medium transition-colors",
              mode === "existing" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground")}
          >
            {t("Existing")}
          </button>
          <button
            type="button"
            onClick={() => onModeChange("new")}
            className={cn("px-3 h-7 text-xs font-medium border-l border-border transition-colors flex items-center gap-1",
              mode === "new" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground")}
          >
            <Plus className="h-3 w-3" />{t("New")}
          </button>
        </div>
      </div>

      {mode === "existing" ? (
        <CollectionPicker collections={collections} value={value} onChange={onValue} valueOf={valueOf} />
      ) : (
        <div className="panel flex gap-3 p-3">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
            {previewImage ? (
              <Image src={previewImage} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <Input
                value={draft.name}
                onChange={(e) => draft.setName(e.target.value)}
                placeholder={`${noun.charAt(0).toUpperCase() + noun.slice(1)} name`}
                className="h-9 text-sm"
              />
              <Input
                value={draft.symbol}
                onChange={(e) => draft.setSymbol(e.target.value.toUpperCase())}
                placeholder={t("SYMBOL")}
                className="h-9 text-sm"
              />
            </div>
            <Textarea
              value={draft.description}
              onChange={(e) => draft.setDescription(e.target.value)}
              placeholder={`Describe this ${noun}…`}
              rows={2}
              className="text-sm resize-none"
            />
            <p className="text-2xs text-muted-foreground">{t("Prefilled from the title and description — edit anything above.")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
