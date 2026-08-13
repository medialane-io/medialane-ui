"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Wallet } from "lucide-react";
import { cn } from "../utils/cn.js";

// ── Header buttons ────────────────────────────────────────────────────────────

export interface NavBrandButtonProps {
  /** Defaults to opening the nav command menu (`ml:nav-open`). */
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
  /** Path to the brand icon image (the app's real icon asset). */
  iconSrc?: string;
}

/**
 * The main header trigger: brand mark + menu glyph in one quiet glass pill.
 * Mobile-first — a single ≥44px tap target instead of two small adjacent icons.
 * With no `onClick`, it opens the NavCommandMenu mounted elsewhere in the app.
 */
export function NavBrandButton({ onClick, className, iconSrc = "/icon.png", ...rest }: NavBrandButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => document.dispatchEvent(new CustomEvent(ML_NAV_OPEN)))}
      aria-label={rest["aria-label"] ?? "Open navigation"}
      className={cn(
        "group flex h-11 items-center gap-2 rounded-full",
        "bg-background/10 pl-2.5 pr-3 backdrop-blur-xl backdrop-saturate-150",
        "transition-colors hover:bg-background/20 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconSrc} alt="Medialane" width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
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
        "relative flex h-11 w-11 items-center justify-center rounded-full",
        "bg-background/10 text-muted-foreground backdrop-blur-xl backdrop-saturate-150",
        "transition-colors hover:bg-background/20 hover:text-foreground active:scale-[0.97]",
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

export interface NavWalletTriggerProps {
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
  /** Whether a wallet is currently connected. */
  connected?: boolean;
  /**
   * The connected wallet's own icon (e.g. Argent/Braavos/Cartridge). Optional —
   * apps with no single "connected wallet" identity to show (e.g. an
   * email/social-login app) simply omit it and get the plain glyph below.
   */
  iconSrc?: string;
  /**
   * Override for the disconnected-state glyph (default: a plain `Wallet`
   * icon). Apps whose actual connect entry point isn't a wallet — e.g. an
   * email/social-login app whose users primarily sign in with Google — can
   * pass a more accurate icon here so the ring points at what will really
   * happen on click.
   */
  disconnectedIcon?: React.ReactNode;
  /**
   * Override for the connected-state glyph when there's no `iconSrc` (default:
   * a plain `User` icon). Apps whose account is a self-custody key rather than
   * a connected third-party wallet can pass a more accurate icon here (e.g. a
   * shield-user glyph) so the trigger doesn't imply a custodial identity it
   * isn't.
   */
  connectedIcon?: React.ReactNode;
}

/**
 * The right-side counterpart to `NavBrandButton` for a wallet/account entry
 * point: the same glass pill material, with a thin brand-gradient ring
 * traced around the rim instead of a static icon. Not connected — the ring
 * rotates slowly (an ambient "something opens here" cue) around a plain
 * `Wallet` glyph (override via `disconnectedIcon` — e.g. a Google mark for an
 * email/social-login app), so the trigger reads as an actionable connect
 * entry point rather than disappearing into the header (users weren't
 * noticing the bare ring). Connected — the ring settles to a static accent
 * and shows the connected
 * wallet's own icon via `iconSrc` when the caller has one; otherwise a plain
 * `User` glyph (never a fabricated generic avatar).
 */
export const NavWalletTrigger = React.forwardRef<HTMLButtonElement, NavWalletTriggerProps>(
  function NavWalletTrigger({ onClick, className, connected = false, iconSrc, disconnectedIcon, connectedIcon, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={rest["aria-label"] ?? (connected ? "Account" : "Connect wallet")}
        className={cn(
          "ml-nav-wallet-trigger relative flex h-11 w-11 items-center justify-center rounded-full",
          "bg-background/10 text-muted-foreground backdrop-blur-xl backdrop-saturate-150",
          "transition-colors hover:bg-background/20 hover:text-foreground active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          connected && "ml-nav-wallet-trigger--connected",
          className
        )}
      >
        <span className="ml-nav-wallet-ring" aria-hidden="true" />
        {connected
          ? (iconSrc
              ? <img src={iconSrc} alt="" width={16} height={16} className="h-4 w-4 shrink-0 rounded-full" />
              : (connectedIcon ?? <User className="h-3.5 w-3.5" />))
          : (disconnectedIcon ?? <Wallet className="h-3.5 w-3.5" />)}
      </button>
    );
  }
);

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
  /** The app's account/wallet panel content — identity, network, disconnect, etc. */
  children: React.ReactNode;
}

/**
 * The wallet-side surface: a centered, backdrop-blurred panel — the exact
 * same overlay + card treatment as `NavCommandMenu` (`.nav-canvas-overlay`,
 * `bg-background/90 backdrop-blur-2xl backdrop-saturate-150`), so every
 * global panel in the header reads as one system. No built-in title — this
 * is an account/wallet card, not a menu; content is entirely app-owned.
 *
 * Opens via `useNavAccountSheet().open()`. Mutually exclusive with the
 * command menu: opening one closes the other, and the shared `ml:nav-close`
 * event (fired by `useNavCommandMenu().close()`) closes this too.
 */
export function NavAccountSheet({ children }: NavAccountSheetProps) {
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
          {/* Backdrop blur — identical to NavCommandMenu's */}
          <motion.div
            className="nav-canvas-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          />

          {/* Panel — centered on desktop, bottom sheet on mobile, same as NavCommandMenu */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-end justify-center p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center sm:p-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          >
            <div
              className="relative w-full max-w-[380px] overflow-hidden rounded-[20px] border border-border/40 bg-background/90 backdrop-blur-2xl backdrop-saturate-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
                <span className="h-1 w-9 rounded-full bg-muted-foreground/30" />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="px-4 pb-4 pt-5 sm:pt-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
