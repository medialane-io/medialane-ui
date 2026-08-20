"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../utils/cn.js";

export interface NavCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;

  keywords?: string[];

  description?: string;
}

export interface NavCommandGroup {

  heading?: string;
  items: NavCommand[];
}

export interface NavCommandMenuProps {
  commands: NavCommandGroup[];

  trigger?: React.ReactNode;

  accountSlot?: React.ReactNode;

  footerSlot?: React.ReactNode;

  showKeyboardHints?: boolean;

  brandSlot?: React.ReactNode;
}

const ML_NAV_OPEN  = "ml:nav-open";
const ML_NAV_CLOSE = "ml:nav-close";

export function useNavCommandMenu() {
  return {
    open:  () => document.dispatchEvent(new CustomEvent(ML_NAV_OPEN)),
    close: () => document.dispatchEvent(new CustomEvent(ML_NAV_CLOSE)),
  };
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-[18px] items-center justify-center rounded-md bg-muted/60 px-1.5 py-0.5",
        "font-sans text-2xs leading-none text-muted-foreground",
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
            primary ? "text-base font-medium" : "text-sm"
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

export function NavCommandMenu({
  commands,
  trigger,
  accountSlot,
  footerSlot,
  showKeyboardHints = true,
  brandSlot,
}: NavCommandMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
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

            <motion.div
              className="nav-canvas-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              className="fixed inset-0 z-[101] flex items-end justify-center p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center sm:p-4"
              initial={{ opacity: 0, y: 24, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setOpen(false)}
            >
              <div
                className={cn(
                  "flex w-full max-h-[85dvh] flex-col overflow-hidden rounded-[20px] sm:max-h-[min(680px,88dvh)] sm:max-w-[620px]",
                  "bg-background/90 backdrop-blur-2xl backdrop-saturate-150"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Command shouldFilter label="Medialane navigation" className="flex min-h-0 flex-1 flex-col">

                  <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
                    <span className="h-1 w-9 rounded-full bg-muted-foreground/30" />
                  </div>

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
                      className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
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

                  <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
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

                  <div className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/20 px-3 py-2">
                    <div className="flex items-center gap-3">
                      {footerSlot}
                      {showKeyboardHints && (
                        <span className="hidden items-center gap-3 text-[10.5px] text-muted-foreground/70 sm:flex">
                          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> Navigate</span>
                          <span className="flex items-center gap-1"><Kbd>↵</Kbd> Open</span>
                        </span>
                      )}
                    </div>
                    {brandSlot ?? (
                      <span className="flex shrink-0 items-center gap-2 text-2xs text-muted-foreground/50">
                        medialane
                        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
                      </span>
                    )}
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
