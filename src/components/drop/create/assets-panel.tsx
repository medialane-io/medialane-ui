"use client";

import { useState } from "react";
import { Check, FileText, Film, ImagePlus, Images, Music } from "lucide-react";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { Switch } from "../../switch.js";
import { DropPanel, type PanelProps } from "./drop-panel.js";
import { AssetEditor } from "./asset-editor.js";
import { MAX_DROP_SUPPLY } from "../../../utils/drop/metadata.js";
import { assetImage, assetKind, draftTokens, newAsset, type DraftAsset } from "../../../utils/drop/draft.js";
import { msg } from "../../../i18n/translate.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { acceptFor, uploadError } from "../../../utils/upload-limits.js";
import { cn } from "../../../utils/cn.js";
import { useT } from "../../../i18n/provider.js";
import type { Phrase } from "../../../i18n/translate.js";
import { useFormat } from "../../../i18n/use-format.js";

export const KIND_ICON = { image: Images, video: Film, audio: Music, document: FileText } as const;
export const KIND_LABEL = { image: msg("Image"), video: msg("Video"), audio: msg("Audio"), document: msg("PDF") } as const;

export function AssetsPanel({ draft, setDraft, errors, open, onToggle }: PanelProps) {
  const t = useT();
  const intl = useFormat();
  const [rejected, setRejected] = useState<{ name: string; reason: Phrase }[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCopies, setBulkCopies] = useState("");
  const [bulkTrait, setBulkTrait] = useState({ key: "", value: "" });
  const assets = draft.assets;
  const tokens = draftTokens(draft);

  const setAssets = (next: DraftAsset[]) => setDraft({ assets: next });
  const updateSelected = (patch: (a: DraftAsset) => Partial<DraftAsset>) =>
    setAssets(assets.map((a) => (selected.has(a.id) ? { ...a, ...patch(a) } : a)));

  const add = (files: File[]) => {
    const problems: { name: string; reason: Phrase }[] = [];
    const accepted = files.filter((file) => {
      const reason = uploadError(file, "media");
      if (reason) problems.push({ name: file.name, reason });
      return !reason;
    });
    setRejected(problems);
    if (accepted.length > 0) setAssets([...assets, ...accepted.map(newAsset)]);
  };

  const remove = (ids: Set<string>) => {
    const next = assets.filter((a) => !ids.has(a.id));
    setAssets(next);
    setSelected(new Set());
    if (editing !== null) setEditing(next.length === 0 ? null : Math.min(editing, next.length - 1));
  };

  const totals = (
    <>
      {t.plural("{count} token", "{count} tokens", tokens, { count: intl.number(tokens) })}{" "}
      {t.plural("from {count} asset", "from {count} assets", assets.length, { count: intl.number(assets.length) })}
    </>
  );
  const firstAssetError = Object.values(errors.assets.byId).map((e) => e.feature ?? e.copies ?? e.traits).find(Boolean);

  return (
    <DropPanel
      icon={<Images />}
      title={t("NFTs")}
      open={open}
      onToggle={onToggle}
      error={errors.assets.list ?? firstAssetError}
      summary={assets.length === 0 ? t("Add an NFT") : (
        <span className="flex items-center gap-2.5">
          <span className="flex -space-x-1.5">
            {assets.slice(0, 4).map((a) => {
              const image = assetImage(a);
              return image
                ? <img key={a.id} src={previewUrl(image)} alt="" className="h-6 w-6 rounded-md object-cover ring-2 ring-background" />
                : <span key={a.id} className="h-6 w-6 rounded-md bg-muted ring-2 ring-background" />;
            })}
          </span>
          {assets.length > 4 && <span>+{assets.length - 4}</span>}
          <span>{t.plural("{count} token", "{count} tokens", tokens, { count: intl.number(tokens) })}</span>
        </span>
      )}
    >
      <div
        className="space-y-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); add(Array.from(e.dataTransfer.files)); }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {assets.length > 0 ? <p className={cn("text-sm", tokens > MAX_DROP_SUPPLY ? "text-destructive" : "text-muted-foreground")}>{totals}</p> : <span />}
          <div className="flex gap-2">
            {assets.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => { setSelecting(!selecting); setSelected(new Set()); }}>
                {selecting ? t("Cancel") : t("Select")}
              </Button>
            )}
            <Button asChild variant="soft" size="sm" className="bg-muted text-foreground hover:bg-muted/70">
              <label className="cursor-pointer">
                <ImagePlus className="h-4 w-4" />{t("Add media")}
                <input type="file" multiple data-testid="assets-input" accept={acceptFor("media")} className="hidden"
                  onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
              </label>
            </Button>
          </div>
        </div>

        {rejected.length > 0 && (
          <ul className="space-y-1 text-sm text-destructive" role="alert">
            {rejected.map((r) => <li key={r.name}>{r.name}: {t(r.reason.text, r.reason.vars)}</li>)}
          </ul>
        )}

        {assets.length === 0 ? (
          <label className="grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <ImagePlus className="h-7 w-7" />
            <span className="text-foreground">{t("Drop media here or tap to add")}</span>
            <span className="text-xs">{t("Images, video, audio or PDF")}</span>
            <input type="file" multiple accept={acceptFor("media")} className="hidden"
              onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
          </label>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {assets.map((a, i) => {
              const isSelected = selected.has(a.id);
              const invalid = !!errors.assets.byId[a.id];
              const kind = assetKind(a);
              const image = assetImage(a);
              const KindIcon = KIND_ICON[kind];
              return (
                <button key={a.id} type="button" data-testid="asset-card" aria-pressed={selecting ? isSelected : undefined}
                  onClick={() => {
                    if (!selecting) return setEditing(i);
                    const next = new Set(selected);
                    if (isSelected) next.delete(a.id); else next.add(a.id);
                    setSelected(next);
                  }}
                  className={cn("group relative overflow-hidden rounded-xl bg-muted text-left", invalid && "ring-2 ring-destructive", isSelected && "ring-2 ring-primary")}>
                  {image
                    ? <img src={previewUrl(image)} alt={a.name || a.file.name} className="aspect-square w-full object-cover" />
                    : <span className="grid aspect-square w-full place-items-center"><KindIcon className="h-7 w-7 text-muted-foreground" /></span>}
                  {kind !== "image" && !selecting && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium">{t(KIND_LABEL[kind])}</span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-5 text-xs font-medium text-white">
                    {a.name.trim() || `#${i + 1}`}
                  </span>
                  {Number(a.copies) > 1 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">×{a.copies}</span>
                  )}
                  {selecting && (
                    <span className={cn("absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white", isSelected ? "bg-primary" : "bg-black/30")}>
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {selecting && (
          <div className="space-y-3 rounded-xl bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t.plural("{count} selected", "{count} selected", selected.size)}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set(assets.map((a) => a.id)))}>{t("Select all")}</Button>
            </div>
            <div className="flex gap-2">
              <Input aria-label={t("Copies for selected")} inputMode="numeric" placeholder={t("Copies")} value={bulkCopies}
                onChange={(e) => setBulkCopies(e.target.value.trim())} />
              <Button type="button" variant="soft" disabled={selected.size === 0 || !bulkCopies}
                onClick={() => updateSelected(() => ({ copies: bulkCopies }))}>{t("Set copies")}</Button>
            </div>
            <div className="flex gap-2">
              <Input aria-label={t("Detail name for selected")} placeholder={t("Detail")} value={bulkTrait.key}
                onChange={(e) => setBulkTrait({ ...bulkTrait, key: e.target.value })} />
              <Input aria-label={t("Detail value for selected")} placeholder={t("Value")} value={bulkTrait.value}
                onChange={(e) => setBulkTrait({ ...bulkTrait, value: e.target.value })} />
              <Button type="button" variant="soft" disabled={selected.size === 0 || !bulkTrait.key.trim() || !bulkTrait.value.trim()}
                onClick={() => updateSelected((a) => ({ traits: [...a.traits.filter((tr) => tr.key.trim().toLowerCase() !== bulkTrait.key.trim().toLowerCase()), { key: bulkTrait.key.trim(), value: bulkTrait.value.trim() }] }))}>
                {t("Add detail")}
              </Button>
            </div>
            <Button type="button" variant="ghost" className="text-destructive" disabled={selected.size === 0} onClick={() => remove(selected)}>
              {t("Remove")}
            </Button>
          </div>
        )}

        {assets.length > 1 && (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="block font-medium">{t("Shuffle the order")}</span>
              <span className="block text-muted-foreground">{t("Off: NFTs go out in the order shown.")}</span>
            </span>
            <Switch checked={draft.mixOrder} onCheckedChange={(mixOrder) => setDraft({ mixOrder })} />
          </label>
        )}
      </div>

      {editing !== null && (
        <AssetEditor
          draft={draft}
          index={editing}
          onIndex={setEditing}
          errors={errors}
          onClose={() => setEditing(null)}
          onChange={(id, patch) => setAssets(assets.map((a) => (a.id === id ? { ...a, ...patch } : a)))}
          onRemove={(id) => remove(new Set([id]))}
        />
      )}
    </DropPanel>
  );
}
