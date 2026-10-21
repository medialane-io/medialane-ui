"use client";

import { useState } from "react";
import { Check, ExternalLink, Flag, MoreHorizontal, Share2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu.js";
import { shareOrCopy } from "../utils/share.js";

export function CollectionMoreMenu({ explorerHref, shareTitle, onReport }: { explorerHref: string; shareTitle: string; onReport: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More options"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={explorerHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            View on explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            void shareOrCopy(shareTitle).then((result) => {
              if (result !== "copied") return;
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? <Check className="text-emerald-500" /> : <Share2 />}
          {copied ? "Link copied" : "Share"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onReport}>
          <Flag />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
