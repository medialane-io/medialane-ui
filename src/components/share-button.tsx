"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "../utils/cn.js";
import { buttonVariants } from "./button.js";
import { shareOrCopy } from "../utils/share.js";
import { useT } from "../i18n/provider.js";

export interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: "soft" | "ghost" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  title,
  url,
  variant = "soft",
  size = "sm",
  className,
}: ShareButtonProps) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if ((await shareOrCopy(title, url)) === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(buttonVariants({ variant, size }), size === "icon" && "min-h-11 min-w-11", className)}
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-brand-blue" />
        : <Share2 className="h-3.5 w-3.5" />
      }
      {size !== "icon" && (
        <span className="ml-1.5">{copied ? t("Copied") : t("Share")}</span>
      )}
    </button>
  );
}
