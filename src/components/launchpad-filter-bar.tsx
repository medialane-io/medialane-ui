"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { launchpadSectionId } from "./launchpad-services.js";
import type { ServiceGroup, ServiceGroupDefinition } from "../data/launchpad-services.js";
import { useT } from "../i18n/provider.js";

export interface LaunchpadFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sections: Array<{ group: ServiceGroupDefinition; count: number }>;
}

export function LaunchpadFilterBar({ query, onQueryChange, sections }: LaunchpadFilterBarProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const jumpTo = (key: ServiceGroup) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(launchpadSectionId(key))?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background/95 backdrop-blur-sm flex flex-col lg:flex-row gap-3 lg:items-center">
      <div className="relative lg:w-72 lg:shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("Search services")}
          className="w-full h-10 rounded-full border border-border bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple/40"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label={t("Clear search")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex h-5 w-5 items-center justify-center rounded-full text-2xs font-medium text-muted-foreground pointer-events-none bg-background/40">
            /
          </kbd>
        )}
      </div>

      <nav aria-label={t("Launchpad sections")} className="flex gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
        {sections.map(({ group, count }) => (
          <button
            key={group.key}
            type="button"
            onClick={() => jumpTo(group.key)}
            className="h-8 shrink-0 px-3.5 rounded-full text-xs font-semibold transition-colors inline-flex items-center gap-1.5 bg-background/40 text-muted-foreground active:bg-muted/60 sm:hover:bg-muted/40 sm:hover:text-foreground"
          >
            {t(group.title)}
            <span className="tabular-nums text-muted-foreground/60">{count}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
