"use client";

import { useRef, useState } from "react";
import { CalendarClock, Lock, Package, ShieldCheck } from "lucide-react";
import { ActionButton } from "../../action-button.js";
import { CollapsibleSection } from "../../collapsible-section.js";
import { ClaimRouteShell } from "../../claim-route-shell.js";
import { Dropzone } from "../../fast-mint/dropzone.js";
import { MedialaneCollectionCard } from "../../medialane-collection-card.js";
import type { DraftItem } from "../../drop-item-list.js";
import { AccessFields, ArtworkFields, FieldError, LicenseFields, NameFields, PriceFields, TimingFields, timingSummary } from "./drop-fields.js";
import { ExclusiveFields } from "./exclusive-fields.js";
import { LaunchDialog } from "./launch-dialog.js";
import { EMPTY_DRAFT, draftSupply, validateDropDraft, type DropDraft, supplyLabel } from "../../../utils/drop/draft.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { suggestLaunchpadSymbol } from "../../../utils/launchpad-defaults.js";
import { acceptFor } from "../../../utils/upload-limits.js";
import { LICENSE_TYPES } from "../../../data/ip.js";
import { useMedialaneApp } from "../../medialane-app.js";
import { useDropFee } from "../../../utils/use-drops.js";
import { useT } from "../../../i18n/provider.js";
import { msg } from "../../../i18n/index.js";
import { useFormat } from "../../../i18n/use-format.js";

const toItem = (file: File): DraftItem => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), name: "", description: "" });

/** The draft with these images: one image is an edition, several are a collection. */
export function withArtwork(draft: DropDraft, files: File[]): Partial<DropDraft> {
  const current: DraftItem[] = draft.kind === "edition" ? (draft.edition ? [toItem(draft.edition)] : []) : draft.items;
  const items = [...current, ...files.map(toItem)];
  if (items.length === 1) return { kind: "edition", edition: items[0]!.file, items: [] };
  return { kind: "collection", edition: null, items };
}

/** The collection's symbol, made from the drop's name. */
export function dropSymbol(name: string): string {
  return suggestLaunchpadSymbol(name) || "DROP";
}

/**
 * Create a drop on one screen: the artwork first, then the name, price and who can mint, with
 * timing, license and exclusive content in panels that stay closed until needed.
 */
export function DropCreate() {
  const t = useT();
  const intl = useFormat();
  const app = useMedialaneApp();
  const feeBps = useDropFee();
  const [draft, setDraftState] = useState<DropDraft>(EMPTY_DRAFT);
  const [tried, setTried] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [timingOpen, setTimingOpen] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const coverRef = useRef<HTMLInputElement | null>(null);
  const setDraft = (patch: Partial<DropDraft>) => setDraftState((d) => ({ ...d, ...patch }));
  const errors = tried ? validateDropDraft(draft, Math.floor(Date.now() / 1000)) : {};
  const hasArt = draft.kind === "edition" ? !!draft.edition : draft.items.length > 0;

  const addFiles = (files: File[]) => setDraftState((d) => ({ ...d, ...withArtwork(d, files) }));

  const launch = () => {
    if (!app.walletAddress) return app.onRequireWallet();
    setTried(true);
    const invalid = validateDropDraft(draft, Math.floor(Date.now() / 1000));
    if (invalid.start || invalid.end || invalid.perWallet) setTimingOpen(true);
    if (Object.keys(invalid).length === 0) setLaunching(true);
  };

  const art = draft.cover ?? (draft.kind === "edition" ? draft.edition : draft.items[0]?.file ?? null);
  const supply = draftSupply(draft);
  const wallet = app.walletAddress;

  const preview = (
    <div className="mx-auto w-full max-w-[260px] space-y-2 lg:max-w-none">
      <MedialaneCollectionCard
        image={art ? previewUrl(art) : null}
        name={draft.name}
        collection={Number.isFinite(supply) && supply > 0 ? supplyLabel(t, draft.kind, supply, intl.number(supply)) : undefined}
        creator={wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : undefined}
      />
      {hasArt && (
        <div className="text-center">
          <button type="button" onClick={() => coverRef.current?.click()} className="text-xs font-semibold text-primary">
            {t("Change cover")}
          </button>
          <input ref={coverRef} type="file" accept={acceptFor("image")} className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setDraft({ cover: f }); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );

  return (
    <ClaimRouteShell
      icon={<Package className="h-4 w-4 text-white" />}
      title={msg("Create a drop")}
      subtitle={msg("One artwork as copies, or a set of unique pieces.")}
      aside={preview}
    >
      {!hasArt ? (
        <Dropzone
          mediaKindLock="image"
          multiple
          title={t("Drop or upload your artwork")}
          subtitle={t("One image becomes copies of one artwork. Several images become a set of unique pieces.")}
          hasWallet={!!wallet}
          onRequireWallet={app.onRequireWallet}
          connectLabel={app.connectLabel}
          onFileSelected={(file) => addFiles([file])}
          onFilesSelected={addFiles}
        />
      ) : (
        <div className="space-y-6">
          <ArtworkFields draft={draft} setDraft={setDraft} errors={errors} onAddFiles={addFiles}
            onRemoveEdition={() => setDraft({ edition: null, cover: null })} />
          <NameFields draft={draft} setDraft={setDraft} errors={errors}
            onNameChange={(name) => setDraft({ name, symbol: dropSymbol(name) })} />
          <PriceFields draft={draft} setDraft={setDraft} errors={errors} feeBps={feeBps} />
          <AccessFields draft={draft} setDraft={setDraft} errors={errors} />

          <div className="space-y-3">
            <CollapsibleSection open={timingOpen} onOpenChange={setTimingOpen}
              icon={<CalendarClock className="h-4 w-4 text-primary" />}
              label={t("Timing and limits")} hint={timingSummary(draft.sale, t)}>
              <TimingFields draft={draft} setDraft={setDraft} errors={errors} />
            </CollapsibleSection>
            <CollapsibleSection open={licenseOpen} onOpenChange={setLicenseOpen}
              icon={<ShieldCheck className="h-4 w-4 text-primary" />}
              label={t("License terms")} hint={t(LICENSE_TYPES.find((l) => l.value === draft.license.licenseType)?.label ?? draft.license.licenseType)}>
              <LicenseFields draft={draft} setDraft={setDraft} />
            </CollapsibleSection>
            <CollapsibleSection open={draft.gated.enabled}
              onOpenChange={(enabled) => setDraft({ gated: { ...draft.gated, enabled } })}
              icon={<Lock className="h-4 w-4 text-primary" />}
              label={t("Exclusive content")} hint={t("Optional · a private link only holders can open")}>
              <ExclusiveFields value={draft.gated} onChange={(v) => setDraft({ gated: { ...draft.gated, ...v } })} />
              <FieldError message={errors.gated} />
            </CollapsibleSection>
          </div>

          {tried && Object.keys(errors).length > 0 && <p className="text-sm font-medium text-destructive">{t("Check the highlighted fields.")}</p>}
          <ActionButton solid big onClick={launch} className="w-full">
            {wallet ? t("Launch drop") : app.connectLabel ?? t("Sign in to launch")}
          </ActionButton>
        </div>
      )}
      {launching && <LaunchDialog open onClose={() => setLaunching(false)} draft={draft} />}
    </ClaimRouteShell>
  );
}
