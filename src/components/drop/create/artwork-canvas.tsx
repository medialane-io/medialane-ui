"use client";

import { useRef, useState } from "react";
import { ImagePlus, Plus } from "lucide-react";
import Image from "../../image.js";
import { IconTile } from "../../icon-tile.js";
import { panelTint } from "../../panel.js";
import { cn } from "../../../utils/cn.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { acceptFor } from "../../../utils/upload-limits.js";
import { useT } from "../../../i18n/provider.js";

export interface ArtworkCanvasProps {
  files: File[];
  cover: File | null;
  onAdd: (files: File[]) => void;
  onRemove: (file: File) => void;
  onCover: (file: File) => void;
}

const imagesIn = (list: FileList | null | undefined) => Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));

/**
 * The drop's artwork, as collectors will see it: a square to tap or drop images on, then the
 * chosen image large with the rest in a strip below.
 */
export function ArtworkCanvas({ files, cover, onAdd, onRemove, onCover }: ArtworkCanvasProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const shown = picked && files.includes(picked) ? picked : files[0] ?? null;
  const pick = () => inputRef.current?.click();

  const dropProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = imagesIn(e.dataTransfer.files); if (f.length) onAdd(f); },
  };

  const input = (
    <input ref={inputRef} type="file" accept={acceptFor("image")} multiple className="hidden" data-testid="artwork-input"
      onChange={(e) => { const f = imagesIn(e.target.files); if (f.length) onAdd(f); e.target.value = ""; }} />
  );

  if (!shown) {
    return (
      <button type="button" onClick={pick} {...dropProps} style={panelTint("blue")}
        className={cn(
          "flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl transition-shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging && "ring-2 ring-primary",
        )}>
        <IconTile size="lg"><ImagePlus /></IconTile>
        <span className="space-y-1 text-center">
          <span className="block text-lg font-semibold">{t("Add artwork")}</span>
          <span className="block text-sm text-muted-foreground">{t("JPG, PNG, GIF, WebP, or SVG")}</span>
        </span>
        {input}
      </button>
    );
  }

  const isCover = (file: File) => (cover ?? files[0]) === file;

  return (
    <div className="space-y-3" {...dropProps}>
      <div className={cn("relative aspect-square overflow-hidden rounded-2xl bg-muted", dragging && "ring-2 ring-primary")}>
        <Image src={previewUrl(shown)} alt={shown.name} fill unoptimized className="object-cover" />
        <div className="absolute right-3 top-3 flex gap-2">
          {files.length > 1 && !isCover(shown) && (
            <Pill onClick={() => onCover(shown)}>{t("Use as cover")}</Pill>
          )}
          <Pill onClick={() => onRemove(shown)}>{t("Remove")}</Pill>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {files.map((file, i) => (
          <button key={`${file.name}-${i}`} type="button" onClick={() => setPicked(file)}
            aria-label={t("Image {n}", { n: i + 1 })}
            className={cn("relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted", file === shown && "ring-2 ring-primary ring-offset-2 ring-offset-background")}>
            <Image src={previewUrl(file)} alt="" fill unoptimized className="object-cover" />
            {files.length > 1 && isCover(file) && (
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] font-semibold text-white">{t("Cover")}</span>
            )}
          </button>
        ))}
        <button type="button" onClick={pick} aria-label={t("Add images")}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground">
          <Plus className="h-5 w-5" />
        </button>
        {input}
      </div>
    </div>
  );
}

function Pill({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-full bg-background/85 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur transition-colors hover:bg-background">
      {children}
    </button>
  );
}
