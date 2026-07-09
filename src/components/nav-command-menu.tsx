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

// ── Component ─────────────────────────────────────────────────────────────────

export function NavCommandMenu({ commands, trigger, accountSlot, footerSlot }: NavCommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
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
      setOpen(false);
      if (cmd.href) router.push(cmd.href);
      else cmd.action?.();
    },
    [router]
  );

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

            {/* Command panel */}
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setOpen(false)}
            >
              <div
                className="w-full max-w-lg bg-background/90 border border-border/40 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Command shouldFilter label="Medialane navigation">
                  {/* Search bar */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
                    <Search className="h-[18px] w-[18px] text-muted-foreground shrink-0" />
                    <Command.Input
                      ref={inputRef}
                      placeholder="Type a command or search…"
                      className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => setOpen(false)}
                      className="p-1 rounded-md hover:bg-muted/50 transition-colors"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Results */}
                  <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                    <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                      No results found.
                    </Command.Empty>

                    {commands.map((group, i) => {
                      const primary = !group.heading;
                      return (
                      <React.Fragment key={group.heading ?? `__primary-${i}`}>
                        {i > 0 && (
                          <Command.Separator className="my-1.5 h-px bg-border/40" />
                        )}
                        <Command.Group
                          heading={group.heading}
                          className={cn(
                            "[&_[cmdk-group-heading]]:px-2",
                            "[&_[cmdk-group-heading]]:pt-1.5",
                            "[&_[cmdk-group-heading]]:pb-1",
                            "[&_[cmdk-group-heading]]:text-[11px]",
                            "[&_[cmdk-group-heading]]:font-semibold",
                            "[&_[cmdk-group-heading]]:uppercase",
                            "[&_[cmdk-group-heading]]:tracking-wider",
                            "[&_[cmdk-group-heading]]:text-muted-foreground/70"
                          )}
                        >
                          {group.items.map((item) => (
                            <Command.Item
                              key={item.id}
                              value={[item.label, ...(item.keywords ?? [])].join(" ")}
                              onSelect={() => runCommand(item)}
                              className={cn(
                                "group/item flex items-center gap-3 rounded-xl cursor-pointer",
                                "transition-colors duration-150",
                                "aria-selected:bg-primary/10",
                                primary
                                  ? "px-2.5 py-2.5 text-[15px] font-medium"
                                  : "px-3 py-2 text-sm"
                              )}
                            >
                              {primary ? (
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 group-aria-selected/item:bg-primary/15 transition-colors shrink-0">
                                  <item.icon className="h-[18px] w-[18px] text-foreground/80 group-aria-selected/item:text-primary transition-colors" />
                                </span>
                              ) : (
                                <item.icon className="h-4 w-4 text-muted-foreground group-aria-selected/item:text-foreground transition-colors shrink-0" />
                              )}
                              <span className="flex-1 truncate">{item.label}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-aria-selected/item:text-primary/70 transition-colors shrink-0" />
                            </Command.Item>
                          ))}
                        </Command.Group>
                      </React.Fragment>
                      );
                    })}
                  </Command.List>

                  {accountSlot && (
                    <div className="border-t border-border/40 bg-background/40 px-3 py-3">
                      {accountSlot}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-3 py-2 border-t border-border/40 flex items-center justify-between gap-3">
                    {footerSlot ?? (
                      <span className="text-[10px] text-muted-foreground/50 pl-1">medialane</span>
                    )}
                    <kbd className="text-[10px] text-muted-foreground/50 font-mono shrink-0">⌘K</kbd>
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
