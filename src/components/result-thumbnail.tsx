"use client";

import { useState } from "react";
import Image from "./image.js";
import { cn } from "../utils/cn.js";
import { useImageUrl } from "../utils/use-image-url.js";

export function ResultThumbnail({ src, label, round }: { src: string | null; label: string; round?: boolean }) {
  const resolveImage = useImageUrl();
  const [failed, setFailed] = useState(false);
  const url = src && !failed ? resolveImage(src, { width: 96 }) : null;
  return (
    <span
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-muted/50",
        "text-xs font-semibold text-muted-foreground",
        round ? "rounded-full" : "rounded-lg"
      )}
    >
      {url ? (
        <Image src={url} alt="" fill sizes="32px" className="object-cover" unoptimized onError={() => setFailed(true)} />
      ) : (
        label.replace("@", "").charAt(0).toUpperCase()
      )}
    </span>
  );
}
