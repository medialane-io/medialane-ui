"use client";

import { Loader2, Lock, ShoppingBag, Sparkles, Unlock } from "lucide-react";
import type { ApiCollectionProfile } from "@medialane/sdk";
import { GATED_CONTENT_TYPES, GATED_CONTENT_TYPE_FALLBACK } from "../data/gated-content-types.js";
import { useMedialaneApp } from "./medialane-app.js";
import { useT } from "../i18n/provider.js";
import { panelTint } from "./panel.js";
import { ActionButton } from "./action-button.js";
import { IconTile } from "./icon-tile.js";

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
  const t = useT();
  if (!profile?.hasGatedContent) return null;
  const title = profile.gatedContentTitle ?? "Exclusive content for holders";

  if (state.status === "unlocked") {
    const { icon: Icon } = typeOf(state.content);
    return (
      <button
        onClick={onViewExclusive}
        className="panel w-full flex items-center gap-4 hover:bg-background/40 px-5 py-4 transition-colors text-left"
        style={panelTint("blue")}
      >
        <IconTile>
          <Icon />
        </IconTile>
        <div className="flex-1 min-w-0">
          <p className="text-2xs font-bold text-brand-blue leading-none">{t("✓ You're a holder — unlocked")}</p>
          <p className="text-sm font-bold text-foreground leading-snug mt-1 truncate">{state.content.title ?? title}</p>
        </div>
        <Unlock className="h-4 w-4 text-brand-blue shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={onViewExclusive}
      className="w-full flex items-center gap-4 rounded-2xl hover:bg-background/40 px-5 py-4 transition-colors text-left group"
      style={panelTint("blue")}
    >
      <IconTile>
        <Lock />
      </IconTile>
      <div className="flex-1 min-w-0">
        <p
          className="text-2xs font-bold leading-none mb-1 text-brand-blue"
        >
          {t("Holder exclusive")}
        </p>
        <p className="text-sm font-bold text-foreground leading-snug truncate">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("Own a token from this collection to unlock")}</p>
      </div>
      <Sparkles className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
    </button>
  );
}

function LockedNotice({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="py-16 flex flex-col items-center gap-5 text-center max-w-sm mx-auto">
      <IconTile size="lg">
        <Lock />
      </IconTile>
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
  const t = useT();
  const { connectLabel = "Sign in", onRequireWallet } = useMedialaneApp();

  if (state.status === "signed_out") {
    return (
      <LockedNotice title={t("{label} to unlock", { label: t(connectLabel) })} body={t("This collection has exclusive content for holders. Sign in so we can check your holdings.")}>
        <button type="button" onClick={onRequireWallet} className={PRIMARY}>{t(connectLabel)}</button>
      </LockedNotice>
    );
  }
  if (state.status === "loading") {
    return (
      <div className="py-16 flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">{t("Checking your holdings…")}</p>
      </div>
    );
  }
  if (state.status === "not_holder") {
    return (
      <LockedNotice title={t("Holders only")} body={t("Hold at least one token from this collection to open the exclusive content.")}>
        <button type="button" onClick={onBrowseListings} className={PRIMARY}>
          <ShoppingBag className="h-4 w-4" />
          {t("Browse listings")}
        </button>
      </LockedNotice>
    );
  }
  if (state.status === "error") {
    return <LockedNotice title={t("Couldn't check your holdings")} body={t("Refresh the page to try again.")} />;
  }

  const { icon: Icon, cta } = typeOf(state.content);
  return (
    <div className="py-8 flex flex-col items-center gap-6 text-center max-w-md mx-auto">
      <div className="relative">
        <IconTile size="lg">
          <Unlock />
        </IconTile>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand-blue flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-2xs font-bold text-brand-blue">{t("✓ Verified holder")}</p>
        <h3 className="text-xl font-bold">{state.content.title ?? t("Exclusive content")}</h3>
        <p className="text-sm text-muted-foreground">{t("Your access is verified. Enjoy your exclusive content.")}</p>
      </div>
      <ActionButton solid asChild>
        <a href={state.content.url} target="_blank" rel="noopener noreferrer">
          <Icon className="h-5 w-5" />
          {cta}
        </a>
      </ActionButton>
    </div>
  );
}
