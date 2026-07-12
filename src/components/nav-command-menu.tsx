"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../utils/cn.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  /** Extra search terms beyond the label */
  keywords?: string[];
  /** Optional one-line description shown under the label */
  description?: string;
}

export interface NavCommandGroup {
  /**
   * Optional group heading. Omit it for the primary group so its items
   * read as the top-level menu — they render first, emphasized, with no
   * label, separated from the headed groups below.
   */
  heading?: string;
  items: NavCommand[];
}

export interface NavCommandMenuProps {
  commands: NavCommandGroup[];
  /**
   * Optional trigger element rendered inline at the component's mount point.
   * For most apps, omit this and call `useNavCommandMenu().open()` from a
   * separate button — that keeps the trigger in the right place in the layout.
   */
  trigger?: React.ReactNode;
  /**
   * Optional pinned account/connect area rendered below command results.
   * Apps own the auth implementation here (Clerk, ChipiPay, wallet connectors,
   * Privy, Cartridge, etc.) so the shared nav stays framework-agnostic.
   */
  accountSlot?: React.ReactNode;
  /**
   * Optional control rendered in the footer row (e.g. a theme toggle).
   * Apps own theme state (next-themes etc.) so the shared nav stays
   * framework-agnostic — same pattern as `accountSlot`.
   */
  footerSlot?: React.ReactNode;
}

// ── Singleton hook ─────────────────────────────────────────────────────────────

const ML_NAV_OPEN  = "ml:nav-open";
const ML_NAV_CLOSE = "ml:nav-close";

export function useNavCommandMenu() {
  return {
    open:  () => document.dispatchEvent(new CustomEvent(ML_NAV_OPEN)),
    close: () => document.dispatchEvent(new CustomEvent(ML_NAV_CLOSE)),
  };
}

// ── Recents (localStorage) ─────────────────────────────────────────────────────

const RECENT_KEY = "ml.nav.recent";
const RECENT_MAX = 3;

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  try {
    const next = [id, ...readRecents().filter((x) => x !== id)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are a nicety, never an error */
  }
}

// ── Small primitives ──────────────────────────────────────────────────────────

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-[18px] items-center justify-center rounded-md bg-muted/60 px-1.5 py-0.5",
        "font-sans text-[10px] leading-none text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}

function CommandRow({ item, primary, onSelect }: { item: NavCommand; primary: boolean; onSelect: () => void }) {
  return (
    <Command.Item
      value={[item.label, ...(item.keywords ?? [])].join(" ")}
      onSelect={onSelect}
      className={cn(
        "group/item flex cursor-pointer items-center gap-3 rounded-xl",
        "transition-colors duration-150 aria-selected:bg-primary/10",
        primary ? "px-2.5 py-2.5" : "px-2.5 py-2"
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-colors",
          "bg-muted/50 group-aria-selected/item:bg-primary/15",
          primary ? "h-9 w-9" : "h-8 w-8"
        )}
      >
        <item.icon
          className={cn(
            "text-foreground/80 transition-colors group-aria-selected/item:text-primary",
            primary ? "h-[18px] w-[18px]" : "h-4 w-4"
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate leading-tight",
            primary ? "text-[15px] font-medium" : "text-sm"
          )}
        >
          {item.label}
        </span>
        {item.description && (
          <span className="mt-0.5 block truncate text-[11.5px] leading-tight text-muted-foreground">
            {item.description}
          </span>
        )}
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-colors group-aria-selected/item:text-primary/70" />
    </Command.Item>
  );
}

const GROUP_HEADING_CLASSES = cn(
  "[&_[cmdk-group-heading]]:px-2.5",
  "[&_[cmdk-group-heading]]:pt-2",
  "[&_[cmdk-group-heading]]:pb-1",
  "[&_[cmdk-group-heading]]:text-[10.5px]",
  "[&_[cmdk-group-heading]]:font-semibold",
  "[&_[cmdk-group-heading]]:uppercase",
  "[&_[cmdk-group-heading]]:tracking-[0.08em]",
  "[&_[cmdk-group-heading]]:text-muted-foreground/60"
);

// ── Component ─────────────────────────────────────────────────────────────────

export function NavCommandMenu({ commands, trigger, accountSlot, footerSlot }: NavCommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [recentIds, setRecentIds] = React.useState<string[]>([]);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setRecentIds(readRecents());
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen  = () => setOpen(true);
    const onClose = () => setOpen(false);

    document.addEventListener("keydown", onKey);
    document.addEventListener(ML_NAV_OPEN, onOpen);
    document.addEventListener(ML_NAV_CLOSE, onClose);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener(ML_NAV_OPEN, onOpen);
      document.removeEventListener(ML_NAV_CLOSE, onClose);
    };
  }, []);

  const runCommand = React.useCallback(
    (cmd: NavCommand) => {
      pushRecent(cmd.id);
      setOpen(false);
      if (cmd.href) router.push(cmd.href);
      else cmd.action?.();
    },
    [router]
  );

  // Recents only render while the query is empty (search results replace them).
  const recentItems = React.useMemo(() => {
    if (recentIds.length === 0) return [];
    const all = new Map(commands.flatMap((g) => g.items.map((it) => [it.id, it] as const)));
    return recentIds.map((id) => all.get(id)).filter((it): it is NavCommand => Boolean(it));
  }, [recentIds, commands]);
  const showRecents = query === "" && recentItems.length > 0;

  return (
    <>
      {trigger}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop blur */}
            <motion.div
              className="nav-canvas-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
            />

            {/* Command panel — centered on desktop, bottom sheet on mobile */}
            <motion.div
              className="fixed inset-0 z-[101] flex items-end justify-center sm:items-center sm:p-4"
              initial={{ opacity: 0, y: 24, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setOpen(false)}
            >
              <div
                className={cn(
                  "flex w-full max-h-[88dvh] flex-col overflow-hidden sm:max-h-[min(680px,88dvh)] sm:max-w-[620px]",
                  "rounded-t-[20px] sm:rounded-[20px]",
                  "border border-border/40 bg-background/90 shadow-2xl backdrop-blur-2xl backdrop-saturate-150"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Command shouldFilter label="Medialane navigation" className="flex min-h-0 flex-1 flex-col">
                  {/* Drag handle (mobile) */}
                  <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
                    <span className="h-1 w-9 rounded-full bg-muted-foreground/30" />
                  </div>

                  {/* Search bar */}
                  <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3.5">
                    <Search
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        query ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <Command.Input
                      ref={inputRef}
                      value={query}
                      onValueChange={setQuery}
                      placeholder="Search or run a command…"
                      className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                    />
                    <Kbd className="hidden sm:inline-flex">esc</Kbd>
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded-md p-1 transition-colors hover:bg-muted/50 sm:hidden"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Results */}
                  <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                    <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                      No results found.
                    </Command.Empty>

                    {showRecents && (
                      <Command.Group heading="Recent" className={GROUP_HEADING_CLASSES}>
                        {recentItems.map((item) => (
                          <CommandRow
                            key={`recent-${item.id}`}
                            item={item}
                            primary={false}
                            onSelect={() => runCommand(item)}
                          />
                        ))}
                      </Command.Group>
                    )}

                    {commands.map((group, i) => {
                      const primary = !group.heading;
                      return (
                      <React.Fragment key={group.heading ?? `__primary-${i}`}>
                        {(i > 0 || showRecents) && (
                          <Command.Separator className="my-1.5 h-px bg-border/40" />
                        )}
                        <Command.Group heading={group.heading} className={GROUP_HEADING_CLASSES}>
                          {group.items.map((item) => (
                            <CommandRow
                              key={item.id}
                              item={item}
                              primary={primary}
                              onSelect={() => runCommand(item)}
                            />
                          ))}
                        </Command.Group>
                      </React.Fragment>
                      );
                    })}
                  </Command.List>

                  {accountSlot && (
                    <div className="border-t border-border/40 bg-muted/20 px-3 py-3">
                      {accountSlot}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-3">
                      {footerSlot}
                      <span className="hidden items-center gap-3 text-[10.5px] text-muted-foreground/70 sm:flex">
                        <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span>
                        <span className="flex items-center gap-1"><Kbd>↵</Kbd> Open</span>
                      </span>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground/50">
                      medialane
                      <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
                    </span>
                  </div>
                </Command>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
