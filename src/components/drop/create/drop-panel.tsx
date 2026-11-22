"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { IconTile } from "../../icon-tile.js";
import { cn } from "../../../utils/cn.js";
import type { DropDraft, DropDraftErrors } from "../../../utils/drop/draft.js";
import { useT } from "../../../i18n/provider.js";
import type { Phrase } from "../../../i18n/translate.js";

export interface PanelProps {
  draft: DropDraft;
  setDraft: (patch: Partial<DropDraft>) => void;
  errors: DropDraftErrors;
  open: boolean;
  onToggle: () => void;
}

export function DropPanel({ icon, title, summary, error, open, onToggle, children }: {
  icon: ReactNode;
  title: string;
  summary: ReactNode;
  error?: Phrase;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <section className="rounded-2xl border border-border bg-background">
      <button type="button" aria-expanded={open} onClick={onToggle}
        className="flex w-full items-center gap-3.5 rounded-2xl p-4 text-left transition-colors hover:bg-muted/30 sm:p-5">
        <IconTile size="sm" className="h-10 w-10 [&_svg]:h-5 [&_svg]:w-5">{icon}</IconTile>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block text-[15px] font-semibold">{title}</span>
          {error
            ? <span className="block text-sm text-destructive">{t(error.text, error.vars)}</span>
            : <span className="block text-sm text-muted-foreground">{summary}</span>}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-5 border-t border-border/60 p-4 sm:p-5">{children}</div>}
    </section>
  );
}
