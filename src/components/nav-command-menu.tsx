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
  heading: string;
  items: NavCommand[];
}

interface NavCommandMenuProps {
  commands: NavCommandGroup[];
  /**
   * Optional trigger element rendered inline at the component's mount point.
   * For most apps, omit this and call `useNavCommandMenu().open()` from a
   * separate button — that keeps the trigger in the right place in the layout.
   */
  trigger?: React.ReactNode;
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

export function NavCommandMenu({ commands, trigger }: NavCommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

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
            {/* Aurora blobs — vivid intensity */}
            <motion.div
              className="nav-canvas-aurora"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="aurora-purple animate-blob w-[60vw] h-[60vw] -top-[10vw] -left-[10vw]"
                   style={{ opacity: 0.25 }} />
              <div className="aurora-blue animate-blob-slow w-[50vw] h-[50vw] -top-[5vw] -right-[10vw]"
                   style={{ opacity: 0.2 }} />
              <div className="aurora-rose animate-blob w-[45vw] h-[45vw] bottom-[5vw] -left-[5vw]"
                   style={{ opacity: 0.15 }} />
              <div className="aurora-orange animate-blob-slow w-[40vw] h-[40vw] -bottom-[5vw] -right-[5vw]"
                   style={{ opacity: 0.15 }} />
            </motion.div>

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
            >
              <div
                className="w-full max-w-lg bg-background/90 border border-border/40 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Command shouldFilter label="Medialane navigation">
                  {/* Search bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Command.Input
                      placeholder="Type a command or search…"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
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

                    {commands.map((group, i) => (
                      <React.Fragment key={group.heading}>
                        {i > 0 && (
                          <Command.Separator className="my-1 h-px bg-border/40" />
                        )}
                        <Command.Group
                          heading={group.heading}
                          className={cn(
                            "[&_[cmdk-group-heading]]:px-2",
                            "[&_[cmdk-group-heading]]:py-1.5",
                            "[&_[cmdk-group-heading]]:text-xs",
                            "[&_[cmdk-group-heading]]:font-medium",
                            "[&_[cmdk-group-heading]]:text-muted-foreground"
                          )}
                        >
                          {group.items.map((item) => (
                            <Command.Item
                              key={item.id}
                              value={[item.label, ...(item.keywords ?? [])].join(" ")}
                              onSelect={() => runCommand(item)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer",
                                "transition-colors",
                                "aria-selected:bg-muted/60"
                              )}
                            >
                              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                            </Command.Item>
                          ))}
                        </Command.Group>
                      </React.Fragment>
                    ))}
                  </Command.List>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/50">medialane</span>
                    <kbd className="text-[10px] text-muted-foreground/50 font-mono">⌘K</kbd>
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
