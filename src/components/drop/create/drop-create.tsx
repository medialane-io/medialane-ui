"use client";

import { useState, type ReactNode } from "react";
import { Lock, Package, ShieldCheck } from "lucide-react";
import { profileHref } from "@medialane/sdk";
import { ActionButton } from "../../action-button.js";
import { CollapsibleSection } from "../../collapsible-section.js";
import { ClaimRouteShell } from "../../claim-route-shell.js";
import { MedialaneCollectionCard } from "../../medialane-collection-card.js";
import { AccessFields, ArtworkUpload, CopiesField, FieldError, LicenseFields, NameFields, PriceFields, TimingFields } from "./drop-fields.js";
import { ExclusiveFields } from "./exclusive-fields.js";
import { LaunchDialog } from "./launch-dialog.js";
import { EMPTY_DRAFT, draftSupply, validateDropDraft, type DraftItem, type DropDraft, supplyLabel } from "../../../utils/drop/draft.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { suggestLaunchpadSymbol } from "../../../utils/launchpad-defaults.js";
import { useMedialaneApp } from "../../medialane-app.js";
import { useDropFee } from "../../../utils/use-drops.js";
import { msg } from "../../../i18n/translate.js";
import { useT } from "../../../i18n/provider.js";
import { useFormat } from "../../../i18n/use-format.js";

const toItem = (file: File): DraftItem => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), name: "", description: "" });

export function draftFiles(draft: DropDraft): File[] {
  return draft.kind === "edition" ? (draft.edition ? [draft.edition] : []) : draft.items.map((it) => it.file);
}

export function withArtwork(draft: DropDraft, files: File[]): Partial<DropDraft> {
  const current: DraftItem[] = draft.kind === "edition" ? (draft.edition ? [toItem(draft.edition)] : []) : draft.items;
  const items = [...current, ...files.map(toItem)];
  if (items.length === 1) return { kind: "edition", edition: items[0]!.file, items: [] };
  return { kind: "collection", edition: null, items };
}

export function withoutArtwork(draft: DropDraft, file: File): Partial<DropDraft> {
  if (draft.kind === "edition") return { edition: null };
  const items = draft.items.filter((it) => it.file !== file);
  if (items.length === 1) return { kind: "edition", edition: items[0]!.file, items: [] };
  return { items };
}

export function dropSymbol(name: string): string {
  return suggestLaunchpadSymbol(name) || "DROP";
}

export function DropCreate({ aside }: { aside?: ReactNode }) {
  const t = useT();
  const intl = useFormat();
  const app = useMedialaneApp();
  const feeBps = useDropFee();
  const [draft, setDraftState] = useState<DropDraft>(EMPTY_DRAFT);
  const [tried, setTried] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const setDraft = (patch: Partial<DropDraft>) => setDraftState((d) => ({ ...d, ...patch }));
  const errors = tried ? validateDropDraft(draft, Math.floor(Date.now() / 1000)) : {};
  const files = draftFiles(draft);
  const supply = draftSupply(draft);
  const wallet = app.walletAddress;

  const launch = () => {
    if (!wallet) return app.onRequireWallet();
    setTried(true);
    if (Object.keys(validateDropDraft(draft, Math.floor(Date.now() / 1000))).length === 0) setLaunching(true);
  };

  return (
    <ClaimRouteShell
      icon={<Package className="h-4 w-4 text-white" />}
      title={msg("Collection drop")}
      subtitle={msg("Release your work to collectors at a price and time you choose. Collectors mint straight from your drop page.")}
      aside={
        <>
          <MedialaneCollectionCard
            image={files[0] ? previewUrl(files[0]) : null}
            name={draft.name}
            collection={files.length > 0 && Number.isFinite(supply) && supply > 0 ? supplyLabel(t, draft.kind, supply, intl.number(supply)) : undefined}
            creator={wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : undefined}
            creatorHref={wallet ? profileHref({ address: wallet }) : undefined}
          />
          {aside}
        </>
      }
    >
      <div className="space-y-6">
        <ArtworkUpload
          files={files}
          error={errors.artwork}
          onAdd={(picked) => setDraftState((d) => ({ ...d, ...withArtwork(d, picked) }))}
          onRemove={(file) => setDraftState((d) => ({ ...d, ...withoutArtwork(d, file) }))}
        />
        <NameFields draft={draft} setDraft={setDraft} errors={errors}
          onNameChange={(name) => setDraft({ name, symbol: dropSymbol(name) })} />
        <PriceFields draft={draft} setDraft={setDraft} errors={errors} feeBps={feeBps} />
        {draft.kind === "edition" && <CopiesField draft={draft} setDraft={setDraft} errors={errors} />}
        <AccessFields draft={draft} setDraft={setDraft} errors={errors} />
        <TimingFields draft={draft} setDraft={setDraft} errors={errors} />

        <CollapsibleSection open={licenseOpen} onOpenChange={setLicenseOpen}
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          label={t("License terms")} hint={t("Optional · Berne Convention")}>
          <LicenseFields draft={draft} setDraft={setDraft} />
        </CollapsibleSection>
        <CollapsibleSection open={draft.gated.enabled}
          onOpenChange={(enabled) => setDraft({ gated: { ...draft.gated, enabled } })}
          icon={<Lock className="h-4 w-4 text-primary" />}
          label={t("Exclusive content")} hint={t("Optional · a private link only holders can open")}>
          <ExclusiveFields value={draft.gated} onChange={(v) => setDraft({ gated: { ...draft.gated, ...v } })} />
          <FieldError message={errors.gated} />
        </CollapsibleSection>

        {tried && Object.keys(errors).length > 0 && <p className="text-sm font-medium text-destructive">{t("Check the highlighted fields.")}</p>}
        <ActionButton solid big onClick={launch} className="w-full">
          {wallet ? t("Launch drop") : app.connectLabel ?? t("Sign in to launch")}
        </ActionButton>
        <p className="text-center text-xs text-muted-foreground">{t("Artwork, price and copies can't change after launch.")}</p>
      </div>
      {launching && <LaunchDialog open onClose={() => setLaunching(false)} draft={draft} />}
    </ClaimRouteShell>
  );
}
