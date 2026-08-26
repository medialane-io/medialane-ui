"use client";

import { useRef } from "react";
import { ImagePlus, Upload, LogIn } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { Button } from "../button.js";
import type { MediaKind } from "./types.js";

export interface DropzoneProps {
  mediaKindLock?: MediaKind;
  presentation?: "inline" | "dialog";
  hasWallet: boolean;
  onRequireWallet: () => void;
  onFileSelected: (file: File) => void;
  connectLabel?: string;
}

export function Dropzone({
  mediaKindLock,
  presentation = "inline",
  hasWallet,
  onRequireWallet,
  onFileSelected,
  connectLabel = "Sign in",
}: DropzoneProps) {
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const openMediaPicker = () => {
    if (!hasWallet) { onRequireWallet(); return; }
    mediaInputRef.current?.click();
  };

  return (
    <section
      role="button"
      tabIndex={0}
      aria-label={hasWallet ? "Upload media" : `${connectLabel} to upload media`}
      onClick={openMediaPicker}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openMediaPicker(); } }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (!hasWallet) { onRequireWallet(); return; } const f = e.dataTransfer.files?.[0]; if (f) onFileSelected(f); }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors text-center rounded-3xl border-[3px] border-dashed border-brand-blue/40 hover:border-brand-blue/70 hover:bg-brand-blue/[0.04] p-6",
        presentation === "dialog" ? "min-h-[16rem] sm:min-h-[18rem]" : "min-h-[20rem] sm:min-h-[24rem]"
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
        <ImagePlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1.5 px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {mediaKindLock ? `Drop or upload an ${mediaKindLock}` : "Drop or upload your media"}
        </h2>
        <p className="text-base text-muted-foreground max-w-sm mx-auto">
          {mediaKindLock === "image" ? "It becomes your avatar and app theme." : "Protect your creation and monetize it worldwide."}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="rounded-full mt-1 bg-card"
        onClick={(e) => { e.stopPropagation(); openMediaPicker(); }}
      >
        {hasWallet ? (
          <>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Browse files
          </>
        ) : (
          <>
            <LogIn className="h-3.5 w-3.5 mr-1.5" />
            {connectLabel}
          </>
        )}
      </Button>
      <p className="text-2xs text-muted-foreground/70">
        {mediaKindLock === "image" ? "JPG, PNG, GIF, WebP, or SVG up to 100 MB" : "Images, audio, video, and PDFs up to 100 MB; other documents up to 20 MB"}
      </p>
      <input
        ref={mediaInputRef}
        type="file"
        accept={mediaKindLock === "image" ? "image/*" : undefined}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelected(f); }}
      />
    </section>
  );
}
