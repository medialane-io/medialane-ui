"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { FileText, ImagePlus, Loader2, Music, Video } from "lucide-react";
import { IP_TEMPLATES } from "../../data/ip-templates.js";
import type { IPType } from "../../data/ip.js";
import { acceptFor } from "../../utils/upload-limits.js";
import { cn } from "../../utils/cn.js";
import type { FormatDefinition, MintFormat } from "./formats/types.js";
import type { MediaKind } from "./types.js";
import { useT } from "../../i18n/provider.js";

const MEDIA_KIND_ICON: Record<MediaKind, typeof ImagePlus> = {
  image: ImagePlus,
  audio: Music,
  video: Video,
  document: FileText,
};

export function MediaRow({
  file, kind, preview, uri, uploading, ipType, inputRef, onSelect,
}: {
  file: File;
  kind: MediaKind;
  preview: string | null;
  uri: string | null;
  uploading: boolean;
  ipType: IPType;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
}) {
  const t = useT();
  const KindIcon = MEDIA_KIND_ICON[kind];
  const template = IP_TEMPLATES[ipType];
  const TemplateIcon = template.icon;
  return (
    <div className="panel flex items-center gap-4 p-3">
      <div className="relative h-14 w-14 rounded-2xl bg-muted overflow-hidden shrink-0">
        {kind === "image" && preview ? (
          <Image src={preview} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <KindIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold truncate">{file.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">
            {uploading ? t("Uploading…") : uri ? t("Uploaded") : t("Upload failed")}
          </p>
          {uri && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium bg-background/40",
                template.color.bg, template.color.text, template.color.border
              )}
            >
              <TemplateIcon className="h-3 w-3" />
              {t(template.label)}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-semibold text-brand-blue hover:underline shrink-0"
      >
        {t("Change")}
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
    </div>
  );
}

export function CoverUpload({
  preview, uploading, inputRef, onSelect,
}: {
  preview: string | null;
  uploading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
}) {
  const t = useT();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{t("Upload a cover image for your asset *")}</label>
      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !uploading) { e.preventDefault(); inputRef.current?.click(); } }}
          className="relative h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
        >
          {preview ? (
            <Image src={preview} alt="" fill className="object-cover" unoptimized />
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          <input ref={inputRef} type="file" accept={acceptFor("image")} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }} />
        </div>
        <p className="text-xs text-muted-foreground">{t("Cover art shown wherever the work is previewed. JPG, PNG, GIF, SVG or WebP.")}</p>
      </div>
    </div>
  );
}

export function FormatPicker({
  formats, value, onChange,
}: {
  formats: ReadonlyArray<Pick<FormatDefinition, "key" | "title" | "hint" | "icon">>;
  value: MintFormat;
  onChange: (format: MintFormat) => void;
}) {
  const t = useT();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" id="fast-mint-format">{t("What do you want to make with it?")}</label>
      <div role="radiogroup" aria-labelledby="fast-mint-format" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map(({ key, icon: Icon, title, hint }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            onClick={() => onChange(key)}
            className={cn("flex items-start gap-3 rounded-xl p-4 text-left transition-colors",
              value === key ? "bg-brand-blue/15" : "hover:bg-muted/40 bg-background/40")}
          >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", value === key ? "text-brand-blue" : "text-muted-foreground")} />
            <span>
              <span className="block text-sm font-semibold">{t(title)}</span>
              <span className="block text-xs mt-0.5 text-muted-foreground">{t(hint)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
