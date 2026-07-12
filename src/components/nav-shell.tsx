"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../utils/cn.js";

// ── Brand mark ────────────────────────────────────────────────────────────────

export interface MedialaneMarkProps {
  size?: number;
  className?: string;
}

/**
 * The Medialane symbol as an inline SVG — electric-blue squircle, sparkle,
 * twin bars, rose→orange dot. Replaces `<img src="/icon.png">` triggers so the
 * mark renders crisp at any size, in any host, with no asset path to break.
 */
export function MedialaneMark({ size = 32, className }: MedialaneMarkProps) {
  const gradId = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="20" y1="20" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6608f" />
          <stop offset="1" stopColor="#fb8b46" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="9" fill="#1a17ff" />
      <path d="M9 6.2 9.9 8.4 12.1 9.3 9.9 10.2 9 12.4 8.1 10.2 5.9 9.3 8.1 8.4Z" fill="#fff" />
      <rect x="14.1" y="4.5" width="1.9" height="23" rx="0.9" fill="#fff" />
      <rect x="17.3" y="4.5" width="1.9" height="23" rx="0.9" fill="#fff" />
      <circle cx="23.4" cy="22.6" r="2.7" fill={`url(#${gradId})`} />
    </svg>
  );
}

// ── Header buttons ────────────────────────────────────────────────────────────

export interface NavBrandButtonProps {
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
}

/**
 * The main header trigger: brand mark + menu glyph in one quiet glass pill.
 * Mobile-first — a single ≥44px tap target instead of two small adjacent icons.
 */
export function NavBrandButton({ onClick, className, ...rest }: NavBrandButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest["aria-label"] ?? "Open navigation"}
      className={cn(
        "group flex h-11 items-center gap-2 rounded-full border border-border/40",
        "bg-background/70 pl-1.5 pr-3 backdrop-blur-xl backdrop-saturate-150 shadow-sm",
        "transition-colors hover:bg-background/90 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className
      )}
    >
      <MedialaneMark size={30} className="shrink-0" />
      <span className="flex flex-col gap-[5px]" aria-hidden="true">
        <span className="h-[1.5px] w-4 rounded-full bg-muted-foreground transition-all group-hover:w-4 group-hover:bg-foreground" />
        <span className="h-[1.5px] w-2.5 rounded-full bg-muted-foreground transition-all group-hover:w-4 group-hover:bg-foreground" />
      </span>
    </button>
  );
}

export interface NavIconButtonProps {
  onClick?: () => void;
  className?: string;
  "aria-label": string;
  /** Show a small brand-colored status dot (e.g. wallet connected). */
  indicator?: boolean;
  children: React.ReactNode;
}

/**
 * Circular glass header button — the right-side counterpart to NavBrandButton
 * (wallet / account trigger).
 */
export function NavIconButton({ onClick, className, indicator, children, ...rest }: NavIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest["aria-label"]}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-full border border-border/40",
        "bg-background/70 text-muted-foreground backdrop-blur-xl backdrop-saturate-150 shadow-sm",
        "transition-colors hover:bg-background/90 hover:text-foreground active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className
      )}
    >
      {children}
      {indicator && (
        <span className="absolute right-[3px] top-[3px] h-2.5 w-2.5 rounded-full border-2 border-background bg-brand-blue" />
      )}
    </button>
  );
}

// ── Account sheet ─────────────────────────────────────────────────────────────

const ML_ACCOUNT_OPEN = "ml:account-open";
const ML_ACCOUNT_CLOSE = "ml:account-close";
const ML_NAV_OPEN = "ml:nav-open";
const ML_NAV_CLOSE = "ml:nav-close";

export function useNavAccountSheet() {
  return {
    open: () => document.dispatchEvent(new CustomEvent(ML_ACCOUNT_OPEN)),
    close: () => document.dispatchEvent(new CustomEvent(ML_ACCOUNT_CLOSE)),
  };
}

export interface NavAccountSheetProps {
  /** The app's account/connect panel (Clerk, wallet connectors, …). */
  children: React.ReactNode;
  /** Optional heading above the panel. */
  title?: string;
}

/**
 * The wallet-side surface: a compact glass sheet anchored to the top-right
 * header button (bottom sheet on mobile). Content is app-owned — pass the same
 * account panel the command menu uses in its accountSlot.
 *
 * Opens via `useNavAccountSheet().open()`. Mutually exclusive with the command
 * menu: opening one closes the other, and the shared `ml:nav-close` event
 * (fired by `useNavCommandMenu().close()`) closes this sheet too, so account
 * panels behave identically in both hosts.
 */
export function NavAccountSheet({ children, title = "Account" }: NavAccountSheetProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onOpen = () => {
      document.dispatchEvent(new CustomEvent(ML_NAV_CLOSE));
      setOpen(true);
    };
    const onClose = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener(ML_ACCOUNT_OPEN, onOpen);
    document.addEventListener(ML_ACCOUNT_CLOSE, onClose);
    document.addEventListener(ML_NAV_OPEN, onClose);
    document.addEventListener(ML_NAV_CLOSE, onClose);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener(ML_ACCOUNT_OPEN, onOpen);
      document.removeEventListener(ML_ACCOUNT_CLOSE, onClose);
      document.removeEventListener(ML_NAV_OPEN, onClose);
      document.removeEventListener(ML_NAV_CLOSE, onClose);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
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
            className="fixed inset-x-0 bottom-0 z-[101] sm:inset-auto sm:right-4 sm:top-4 sm:w-[360px] lg:right-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="overflow-hidden rounded-t-[20px] border border-border/40 bg-background/90 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 sm:rounded-[20px]">
              <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
                <span className="h-1 w-9 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between px-4 pb-1 pt-2 sm:pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {title}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/50"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-3 pb-4 pt-1 sm:pb-3">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
