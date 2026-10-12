"use client";

import { useRef } from "react";
import { ImagePlus, Images } from "lucide-react";
import Image from "../../image.js";
import { Input } from "../../input.js";
import { Section, ToggleGroup } from "../../create-form-primitives.js";
import { DropItemList } from "../../drop-item-list.js";
import { MAX_DROP_SUPPLY } from "../../../utils/drop/metadata.js";
import type { DropDraft, DropDraftErrors } from "../../../utils/drop/draft.js";

export interface SectionProps {
  draft: DropDraft;
  setDraft: (patch: Partial<DropDraft>) => void;
  errors: DropDraftErrors;
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}

export function ImagePick({ file, onPick, label }: { file: File | null; onPick: (f: File) => void; label: string }) {
  const ref = useRef<HTMLInputElement | null>(null);
  const preview = file ? URL.createObjectURL(file) : null;
  return (
    <button type="button" onClick={() => ref.current?.click()}
      className="relative flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 hover:border-primary/50">
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
      {preview
        ? <Image src={preview} alt={label} fill unoptimized className="object-cover" />
        : <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><ImagePlus className="h-6 w-6" />{label}</span>}
    </button>
  );
}

export function ArtworkSection({ draft, setDraft, errors }: SectionProps) {
  return (
    <Section title="Artwork" icon={<Images className="h-4 w-4" />}>
      <ToggleGroup
        value={draft.kind === "edition" ? "Edition" : "Collection"}
        options={["Edition", "Collection"]}
        onChange={(v) => setDraft({ kind: v === "Edition" ? "edition" : "collection" })}
      />
      <p className="text-xs text-muted-foreground">
        {draft.kind === "edition"
          ? "One artwork, sold as numbered copies."
          : "Many unique items — each image becomes its own token."}
      </p>
      {draft.kind === "edition" ? (
        <div className="space-y-4">
          <ImagePick file={draft.edition} onPick={(f) => setDraft({ edition: f })} label="Choose the artwork" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="drop-supply">Copies</label>
            <Input id="drop-supply" inputMode="numeric" value={draft.supply} onChange={(e) => setDraft({ supply: e.target.value.trim() })} className="max-w-[10rem]" />
            <p className="text-xs text-muted-foreground">Up to {MAX_DROP_SUPPLY.toLocaleString("en-US")}.</p>
            <FieldError message={errors.supply} />
          </div>
        </div>
      ) : (
        <DropItemList
          items={draft.items}
          collectionName={draft.name}
          onAddFiles={(files) => setDraft({
            items: [...draft.items, ...files.map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), name: "", description: "" }))],
          })}
          onRemove={(id) => setDraft({ items: draft.items.filter((it) => it.id !== id) })}
          onEdit={(id, patch) => setDraft({ items: draft.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })}
        />
      )}
      <FieldError message={errors.artwork} />
    </Section>
  );
}
