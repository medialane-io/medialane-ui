"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { Textarea } from "../../textarea.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../dialog.js";
import { Field, FieldError } from "./drop-fields.js";
import { assetKind, type DraftAsset, type DropDraft, type DropDraftErrors } from "../../../utils/drop/draft.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { acceptFor, uploadError } from "../../../utils/upload-limits.js";
import { FIELD_LIMITS } from "../../../utils/field-limits.js";
import { useT } from "../../../i18n/provider.js";

export function AssetEditor({ draft, index, onIndex, onChange, onRemove, errors, onClose }: {
  draft: DropDraft;
  index: number;
  onIndex: (i: number) => void;
  onChange: (id: string, patch: Partial<DraftAsset>) => void;
  onRemove: (id: string) => void;
  errors: DropDraftErrors;
  onClose: () => void;
}) {
  const t = useT();
  const [rejected, setRejected] = useState<{ id: string; field: "file" | "feature"; text: string } | null>(null);
  const asset = draft.assets[index];
  if (!asset) return null;
  const count = draft.assets.length;
  const fieldErrors = errors.assets.byId[asset.id] ?? {};
  const set = (patch: Partial<DraftAsset>) => onChange(asset.id, patch);
  const setTrait = (i: number, patch: Partial<DraftAsset["traits"][number]>) =>
    set({ traits: asset.traits.map((tr, j) => (j === i ? { ...tr, ...patch } : tr)) });
  const rejection = (field: "file" | "feature") =>
    rejected?.id === asset.id && rejected.field === field ? { text: rejected.text } : null;
  const take = (field: "file" | "feature", file: File | undefined) => {
    if (!file) return;
    const problem = uploadError(file, field === "file" ? "media" : "image");
    setRejected(problem ? { id: asset.id, field, text: problem } : null);
    if (!problem) set({ [field]: file });
  };
  const collectionName = draft.collection.name.trim() || t("Untitled");
  const kind = assetKind(asset);

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto">
        <div className="flex items-center justify-between gap-3 pr-8">
          <DialogTitle className="text-lg font-semibold">{t("Asset")}</DialogTitle>
          <span className="text-sm text-muted-foreground">{t("{index} of {count}", { index: index + 1, count })}</span>
        </div>
        <DialogDescription className="sr-only">{t("Edit the asset's image and details.")}</DialogDescription>

        <div className="space-y-2">
          <MediaPreview file={asset.file} kind={kind} alt={asset.name || asset.file.name} />
          <Button asChild variant="soft" size="sm" className="bg-muted text-foreground hover:bg-muted/70">
            <label className="cursor-pointer">
              {t("Replace media")}
              <input type="file" data-testid="replace-input" accept={acceptFor("media")} className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  take("file", file);
                }} />
            </label>
          </Button>
          <FieldError message={rejection("file")} />
        </div>

        {kind !== "image" && (
          <Field label={t("Feature image *")}>
            <div className="flex items-center gap-4">
              <label className="relative grid h-24 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl bg-muted">
                {asset.feature
                  ? <img src={previewUrl(asset.feature)} alt={t("Feature image")} className="h-full w-full object-cover" />
                  : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                <input type="file" data-testid="feature-input" accept={acceptFor("image")} className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    take("feature", file);
                  }} />
              </label>
              <p className="text-xs text-muted-foreground">{t("Shown wherever the asset appears.")}</p>
            </div>
            <FieldError message={rejection("feature") ?? fieldErrors.feature} />
          </Field>
        )}

        <Field label={t("Name")} htmlFor="asset-name">
          <Input id="asset-name" value={asset.name} maxLength={FIELD_LIMITS.name} placeholder={`${collectionName} #…`}
            onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label={t("Description")} htmlFor="asset-description">
          <Textarea id="asset-description" rows={3} value={asset.description} maxLength={FIELD_LIMITS.description}
            placeholder={draft.collection.description.trim() || t("Uses the collection description")}
            onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label={t("Copies")} htmlFor="asset-copies">
          <Input id="asset-copies" inputMode="numeric" className="max-w-[10rem]" value={asset.copies}
            onChange={(e) => set({ copies: e.target.value.trim() })} />
          <FieldError message={fieldErrors.copies} />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("Traits")}</p>
          {asset.traits.map((trait, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input aria-label={t("Trait name {n}", { n: i + 1 })} placeholder={t("Trait")} value={trait.key}
                onChange={(e) => setTrait(i, { key: e.target.value })} />
              <Input aria-label={t("Trait value {n}", { n: i + 1 })} placeholder={t("Value")} value={trait.value}
                onChange={(e) => setTrait(i, { value: e.target.value })} />
              <button type="button" aria-label={t("Remove trait")} className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                onClick={() => set({ traits: asset.traits.filter((_, j) => j !== i) })}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => set({ traits: [...asset.traits, { key: "", value: "" }] })}>
            <Plus className="h-3.5 w-3.5" />{t("Add trait")}
          </Button>
          <FieldError message={fieldErrors.traits} />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-4">
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon" aria-label={t("Previous")} disabled={index === 0} onClick={() => onIndex(index - 1)}>
              <ChevronLeft />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label={t("Next")} disabled={index === count - 1} onClick={() => onIndex(index + 1)}>
              <ChevronRight />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="text-destructive" onClick={() => onRemove(asset.id)}>
              <Trash2 />{t("Remove asset")}
            </Button>
            <Button type="button" onClick={onClose}>{t("Done")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaPreview({ file, kind, alt }: { file: File; kind: ReturnType<typeof assetKind>; alt: string }) {
  const src = previewUrl(file);
  if (kind === "image") return <img src={src} alt={alt} className="aspect-square w-full rounded-2xl bg-muted object-cover" />;
  if (kind === "video") return <video src={src} controls className="aspect-video w-full rounded-2xl bg-muted" />;
  if (kind === "audio") return <audio src={src} controls className="w-full" />;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
      <FileText className="h-6 w-6 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm">{file.name}</span>
    </div>
  );
}
