"use client";

import { Loader2, Lock, ShoppingBag, Sparkles, Unlock } from "lucide-react";
import type { ApiCollectionProfile } from "@medialane/sdk";
import { GATED_CONTENT_TYPES, GATED_CONTENT_TYPE_FALLBACK } from "../data/gated-content-types.js";
import { useMedialaneApp } from "./medialane-app.js";

export interface GatedContent {
  title: string | null;
  url: string;
  type: string | null;
}

export type GatedContentState =
  | { status: "signed_out" }
  | { status: "loading" }
  | { status: "not_holder" }
  | { status: "unlocked"; content: GatedContent }
  | { status: "error" };

const typeOf = (content: GatedContent) => (content.type ? GATED_CONTENT_TYPES[content.type] ?? GATED_CONTENT_TYPE_FALLBACK : GATED_CONTENT_TYPE_FALLBACK);

export function GatedContentHero({
  profile,
  state,
  onViewExclusive,
}: {
  profile: ApiCollectionProfile | null;
  state: GatedContentState;
  onViewExclusive: () => void;
}) {
  if (!profile?.hasGatedContent) return null;
  const title = profile.gatedContentTitle ?? "Exclusive content for holders";

  if (state.status === "unlocked") {
    const { icon: Icon } = typeOf(state.content);
    return (
      <button
        onClick={onViewExclusive}
        className="w-full flex items-center gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 px-5 py-4 transition-colors text-left"
      >
        <div className="h-11 w-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-emerald-500 leading-none">✓ You&apos;re a holder — unlocked</p>
          <p className="text-sm font-bold text-foreground leading-snug mt-1 truncate">{state.content.title ?? title}</p>
        </div>
        <Unlock className="h-4 w-4 text-emerald-500 shrink-0" />
      </button>
    );
  }

  return (
    <div className="card-exclusive-wrapper btn-border-animated">
      <button
        onClick={onViewExclusive}
        className="w-full flex items-center gap-4 rounded-[calc(var(--radius)*1.25)] bg-card hover:bg-muted/60 px-5 py-4 transition-colors text-left group"
      >
        <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold leading-none mb-1"
            style={{ background: "linear-gradient(90deg, #3b7bff, #8a5cf6, #f6608f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Holder exclusive
          </p>
          <p className="text-sm font-bold text-foreground leading-snug truncate">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Own a token from this collection to unlock</p>
        </div>
        <Sparkles className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
      </button>
    </div>
  );
}

function LockedNotice({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="py-16 flex flex-col items-center gap-5 text-center max-w-sm mx-auto">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
        <Lock className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{body}</p>
      </div>
      {children}
    </div>
  );
}

const PRIMARY = "inline-flex items-center gap-2 bg-foreground text-background hover:opacity-90 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm";

export function GatedContentPanel({ state, onBrowseListings }: { state: GatedContentState; onBrowseListings: () => void }) {
  const { connectLabel = "Sign in", onRequireWallet } = useMedialaneApp();

  if (state.status === "signed_out") {
    return (
      <LockedNotice title={`${connectLabel} to unlock`} body="This collection has exclusive content for holders. Sign in so we can check your holdings.">
        <button type="button" onClick={onRequireWallet} className={PRIMARY}>{connectLabel}</button>
      </LockedNotice>
    );
  }
  if (state.status === "loading") {
    return (
      <div className="py-16 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Checking your holdings…</p>
      </div>
    );
  }
  if (state.status === "not_holder") {
    return (
      <LockedNotice title="Holders only" body="Hold at least one token from this collection to open the exclusive content.">
        <button type="button" onClick={onBrowseListings} className={PRIMARY}>
          <ShoppingBag className="h-4 w-4" />
          Browse listings
        </button>
      </LockedNotice>
    );
  }
  if (state.status === "error") {
    return <LockedNotice title="Couldn't check your holdings" body="Refresh the page to try again." />;
  }

  const { icon: Icon, cta } = typeOf(state.content);
  return (
    <div className="py-8 flex flex-col items-center gap-6 text-center max-w-md mx-auto">
      <div className="relative">
        <div className="h-20 w-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <Unlock className="h-10 w-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-emerald-500">✓ Verified holder</p>
        <h3 className="text-xl font-bold">{state.content.title ?? "Exclusive content"}</h3>
        <p className="text-sm text-muted-foreground">Your access is verified. Enjoy your exclusive content.</p>
      </div>
      <a
        href={state.content.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/20"
      >
        <Icon className="h-5 w-5" />
        {cta}
      </a>
    </div>
  );
}
