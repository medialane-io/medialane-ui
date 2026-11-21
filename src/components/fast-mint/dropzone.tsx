"use client";

import { useRef } from "react";
import { ImagePlus, Upload, LogIn } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { Button } from "../button.js";
import type { MediaKind } from "./types.js";
import { acceptFor } from "../../utils/upload-limits.js";
import { useT } from "../../i18n/provider.js";

export interface DropzoneProps {
  mediaKindLock?: MediaKind;
  presentation?: "inline" | "dialog";
  hasWallet: boolean;
  onRequireWallet: () => void;
  onFileSelected: (file: File) => void;
  connectLabel?: string;
  /** Accept several files at once; they go to `onFilesSelected`. */
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  title?: string;
  subtitle?: string;
}

export function Dropzone({
  mediaKindLock,
  presentation = "inline",
  hasWallet,
  onRequireWallet,
  onFileSelected,
  connectLabel = "Sign in",
  multiple = false,
  onFilesSelected,
  title,
  subtitle,
}: DropzoneProps) {
  const t = useT();
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const openMediaPicker = () => {
    if (!hasWallet) { onRequireWallet(); return; }
    mediaInputRef.current?.click();
  };

  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    if (multiple && onFilesSelected) onFilesSelected(files);
    else onFileSelected(files[0]!);
  };

  return (
    <section
      role="button"
      tabIndex={0}
      aria-label={hasWallet ? t("Upload media") : t("{label} to upload media", { label: t(connectLabel) })}
      onClick={openMediaPicker}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMediaPicker(); } }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (!hasWallet) { onRequireWallet(); return; } pick(e.dataTransfer.files); }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors text-center rounded-2xl border-[3px] border-dashed border-brand-blue/40 hover:border-brand-blue/70 hover:bg-brand-blue/[0.04] p-6",
        presentation === "dialog" ? "min-h-[16rem] sm:min-h-[18rem]" : "min-h-[20rem] sm:min-h-[24rem]"
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
        <ImagePlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1.5 px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {title ?? (mediaKindLock ? `Drop or upload an ${mediaKindLock}` : t("Drop or upload your media"))}
        </h2>
        <p className="text-base text-muted-foreground max-w-sm mx-auto">
          {subtitle ?? (mediaKindLock === "image" ? t("It becomes your avatar and app theme.") : t("Protect your creation and monetize it worldwide."))}
        </p>
      </div>
      <Button
        type="button"
        variant="soft"
        className="rounded-full mt-1 bg-card"
        onClick={(e) => { e.stopPropagation(); openMediaPicker(); }}
      >
        {hasWallet ? (
          <>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {t("Browse files")}
          </>
        ) : (
          <>
            <LogIn className="h-3.5 w-3.5 mr-1.5" />
            {t(connectLabel)}
          </>
        )}
      </Button>
      <p className="text-2xs text-muted-foreground/70">
        {mediaKindLock === "image" ? t("JPG, PNG, GIF, WebP, or SVG") : t("Images, audio, video, PDFs and documents")}
      </p>
      <input
        ref={mediaInputRef}
        type="file"
        accept={mediaKindLock === "image" ? acceptFor("image") : undefined}
        multiple={multiple}
        className="hidden"
        onChange={(e) => { pick(e.target.files); e.target.value = ""; }}
      />
    </section>
  );
}
