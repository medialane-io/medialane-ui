"use client";

import { useState } from "react";
import { Check, ExternalLink, Flag, MoreHorizontal, Settings, Share2 } from "lucide-react";
import Link from "./link.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu.js";
import { shareOrCopy } from "../utils/share.js";
import { useT } from "../i18n/provider.js";

export function MoreMenu({ explorerHref, shareTitle, settingsHref, onReport }: { explorerHref: string; shareTitle: string; settingsHref?: string; onReport: () => void }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("More options")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {settingsHref ? (
          <DropdownMenuItem asChild>
            <Link href={settingsHref}>
              <Settings />
              {t("Collection settings")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <a href={explorerHref} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            {t("View on explorer")}
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
          {copied ? t("Link copied") : t("Share")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onReport}>
          <Flag />
          {t("Report")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
