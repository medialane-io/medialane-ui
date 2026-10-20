"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import Image from "../../image.js";
import { GradientButton } from "../../gradient-button.js";
import { CollapsibleSection } from "../../collapsible-section.js";
import { ArtworkSection } from "./artwork-section.js";
import { DetailsSection } from "./details-section.js";
import { SaleSection } from "./sale-section.js";
import { ListSection } from "./list-section.js";
import { ExclusiveFields } from "./exclusive-fields.js";
import { LaunchDialog } from "./launch-dialog.js";
import { FieldError } from "./artwork-section.js";
import { EMPTY_DRAFT, draftSupply, validateDropDraft, type DropDraft } from "../../../utils/drop/draft.js";
import { collectorPriceLine } from "../../../utils/drop/sale.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { useMedialaneApp } from "../../medialane-app.js";
import { useDropFee } from "../../../utils/use-drops.js";

export function DropCreate() {
  const app = useMedialaneApp();
  const feeBps = useDropFee();
  const [draft, setDraftState] = useState<DropDraft>(EMPTY_DRAFT);
  const [tried, setTried] = useState(false);
  const [launching, setLaunching] = useState(false);
  const setDraft = (patch: Partial<DropDraft>) => setDraftState((d) => ({ ...d, ...patch }));
  const errors = tried ? validateDropDraft(draft, Math.floor(Date.now() / 1000)) : {};

  const launch = () => {
    if (!app.walletAddress) return app.onRequireWallet();
    setTried(true);
    if (Object.keys(validateDropDraft(draft, Math.floor(Date.now() / 1000))).length === 0) setLaunching(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="space-y-5 lg:order-1 order-2">
      <ArtworkSection draft={draft} setDraft={setDraft} errors={errors} />
      <DetailsSection draft={draft} setDraft={setDraft} errors={errors} />
      <SaleSection draft={draft} setDraft={setDraft} errors={errors} feeBps={feeBps} />
      <ListSection draft={draft} setDraft={setDraft} errors={errors} />
      <CollapsibleSection
        open={draft.gated.enabled}
        onOpenChange={(enabled) => setDraft({ gated: { ...draft.gated, enabled } })}
        icon={<Lock className="h-4 w-4 text-primary" />}
        label="Exclusive content"
        hint="Optional · a private link only holders can open"
      >
        <ExclusiveFields value={draft.gated} onChange={(v) => setDraft({ gated: { ...draft.gated, ...v } })} />
        <FieldError message={errors.gated} />
      </CollapsibleSection>
      {tried && Object.keys(errors).length > 0 && <p className="text-sm font-medium text-destructive">Check the highlighted fields.</p>}
      <GradientButton big onClick={launch}>
        {app.walletAddress ? "Review and launch" : app.connectLabel ?? "Sign in to launch"}
      </GradientButton>
      {launching && <LaunchDialog open onClose={() => setLaunching(false)} draft={draft} />}
    </div>
    <div className="order-1 lg:order-2">
      <div className="lg:sticky lg:top-24"><DraftSummary draft={draft} feeBps={feeBps} /></div>
    </div>
    </div>
  );
}

/** The drop as collectors will see it, updated as the form changes. */
export function DraftSummary({ draft, feeBps }: { draft: DropDraft; feeBps: number | null }) {
  const art = draft.cover ?? (draft.kind === "edition" ? draft.edition : draft.items[0]?.file ?? null);
  const preview = art ? previewUrl(art) : null;
  const supply = draftSupply(draft);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        {preview && <Image src={preview} alt={draft.name || "Drop"} fill unoptimized className="object-cover" />}
      </div>
      <div className="space-y-1 p-4">
        <p className="truncate font-semibold">{draft.name || "Untitled drop"}</p>
        <p className="text-xs text-muted-foreground">
          {draft.sale.paid ? (feeBps === null ? "…" : collectorPriceLine(draft.sale, feeBps) ?? "Set a price") : "Free"}
        </p>
        <p className="text-xs text-muted-foreground">
          {Number.isFinite(supply) && supply > 0 ? `${supply.toLocaleString("en-US")} ${draft.kind === "edition" ? "copies" : "items"}` : "Supply not set"}
          {" · "}{draft.listOnly ? "List only" : "Open to everyone"}
        </p>
      </div>
    </div>
  );
}
