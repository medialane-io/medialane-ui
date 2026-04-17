"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../utils/cn.js";

export interface ShareButtonProps {
  title: string;
  url?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ShareButtonProps["variant"]>, string> = {
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
};

const SIZE_CLASSES: Record<NonNullable<ShareButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-xs rounded-md",
  default: "h-10 px-4 py-2 text-sm rounded-md",
  lg: "h-11 px-8 text-sm rounded-md",
  icon: "h-9 w-9 rounded-md",
};

export function ShareButton({
  title,
  url,
  variant = "outline",
  size = "sm",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // User cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Share2 className="h-3.5 w-3.5" />
      }
      {size !== "icon" && (
        <span className="ml-1.5">{copied ? "Copied" : "Share"}</span>
      )}
    </button>
  );
}
