"use client";

import { useRef, type ReactNode } from "react";
import { AlertCircle, ImagePlus, Loader2, RotateCw, X } from "lucide-react";
import Image from "./image.js";
import { Button } from "./button.js";
import { acceptFor } from "../utils/upload-limits.js";
import { cn } from "../utils/cn.js";
import type { FileUpload } from "../utils/use-file-upload.js";
import { useT } from "../i18n/provider.js";

export interface ImageUploadFieldProps {
  upload: FileUpload;
  label?: ReactNode;
  ariaLabel?: string;
  alt?: string;
  optional?: boolean;
  hint?: ReactNode;
  buttonLabel?: string;
  round?: boolean;
  currentImage?: string | null;
}

export function ImageUploadField({ upload, label, ariaLabel, alt = "", optional, hint, buttonLabel, round, currentImage }: ImageUploadFieldProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, error, uploading } = upload;
  const failed = status === "failed" || !!error;
  const shown = upload.file ? upload.preview : currentImage;
  const hasImage = !!upload.file || !!currentImage;
  const name = typeof label === "string" ? label : ariaLabel ?? t("Upload image");
  const open = () => inputRef.current?.click();

  return (
    <div
      ref={upload.fieldRef}
      role="group"
      aria-label={name}
      tabIndex={-1}
      data-status={status}
      className="space-y-2 outline-none"
    >
      {label ? (
        <p className="text-sm font-medium">
          {label}
          {optional ? <span className="text-muted-foreground font-normal"> {t("(optional)")}</span> : null}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={open}
          disabled={uploading}
          aria-label={name}
          className={cn(
            "relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed bg-muted transition-colors",
            round ? "rounded-full" : "rounded-2xl",
            failed ? "border-destructive" : "border-border hover:border-primary/50",
          )}
        >
          {shown ? (
            <Image src={shown} alt={alt} fill unoptimized className={cn("object-cover", failed && "opacity-30")} />
          ) : failed ? null : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          ) : null}
          {failed ? <AlertCircle className="relative h-7 w-7 text-destructive" /> : null}
        </button>

        <div className="min-w-0 space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept={acceptFor("image")}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload.select(file);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            {upload.canRetry ? (
              <Button type="button" size="sm" onClick={() => void upload.retry()}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                {t("Retry")}
              </Button>
            ) : null}
            <Button type="button" variant="soft" size="sm" disabled={uploading} onClick={open}>
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {t("Uploading…")}
                </>
              ) : hasImage ? t("Change") : buttonLabel ?? t("Upload image")}
            </Button>
          </div>
          {hasImage ? (
            <button
              type="button"
              onClick={upload.clear}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3 w-3" /> {t("Remove")}
            </button>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          ) : status === "uploaded" ? (
            <p className="text-xs text-primary">{t("✓ Uploaded")}</p>
          ) : null}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
