"use client";

import { useState } from "react";
import { ImageIcon, Layers } from "lucide-react";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { Textarea } from "../../textarea.js";
import { DropPanel, type PanelProps } from "./drop-panel.js";
import { Field, FieldError } from "./drop-fields.js";
import { assetImage, type DropDraft } from "../../../utils/drop/draft.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { acceptFor, uploadError } from "../../../utils/upload-limits.js";
import { FIELD_LIMITS } from "../../../utils/field-limits.js";
import { useT } from "../../../i18n/provider.js";

export function coverFile(draft: DropDraft): File | null {
  const first = draft.assets[0];
  return draft.collection.cover ?? (first ? assetImage(first) : null);
}

export function CollectionPanel({ draft, setDraft, errors, open, onToggle }: PanelProps) {
  const t = useT();
  const [coverError, setCoverError] = useState<string | null>(null);
  const collection = draft.collection;
  const set = (patch: Partial<DropDraft["collection"]>) => setDraft({ collection: { ...collection, ...patch } });
  const cover = coverFile(draft);
  const name = collection.name.trim();

  return (
    <DropPanel
      icon={<Layers />}
      title={t("Collection")}
      open={open}
      onToggle={onToggle}
      error={errors.collection.name ?? errors.collection.externalUrl}
      summary={
        <span className="flex items-center gap-2.5">
          {cover && <img src={previewUrl(cover)} alt="" className="h-6 w-6 rounded-md object-cover" />}
          <span className="truncate">{name || t("Name the collection")}</span>
        </span>
      }
    >
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
          {cover
            ? <img src={previewUrl(cover)} alt={t("Cover")} className="h-full w-full object-cover" />
            : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("Cover")}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="soft" size="sm">
              <label className="cursor-pointer">
                {t("Choose cover")}
                <input type="file" data-testid="cover-input" accept={acceptFor("image")} className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    const problem = uploadError(file);
                    setCoverError(problem);
                    if (!problem) set({ cover: file });
                  }} />
              </label>
            </Button>
            {collection.cover && (
              <Button type="button" variant="ghost" size="sm" onClick={() => set({ cover: null })}>{t("Use first asset")}</Button>
            )}
          </div>
          <FieldError message={coverError ? { text: coverError } : null} />
        </div>
      </div>
      <Field label={t("Name *")} htmlFor="drop-name">
        <Input id="drop-name" value={collection.name} maxLength={FIELD_LIMITS.name} placeholder={t("Collection name")}
          onChange={(e) => set({ name: e.target.value })} />
        <FieldError message={errors.collection.name} />
      </Field>
      <Field label={t("Description")} htmlFor="drop-description">
        <Textarea id="drop-description" value={collection.description} maxLength={FIELD_LIMITS.description} rows={4}
          placeholder={t("The story behind the collection…")}
          onChange={(e) => set({ description: e.target.value })} />
      </Field>
      <Field label={t("External link")} htmlFor="drop-link">
        <Input id="drop-link" type="url" inputMode="url" value={collection.externalUrl} placeholder="https://"
          onChange={(e) => set({ externalUrl: e.target.value.trim() })} />
        <FieldError message={errors.collection.externalUrl} />
      </Field>
    </DropPanel>
  );
}
