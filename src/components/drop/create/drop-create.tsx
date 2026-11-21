"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { getListableTokens } from "@medialane/sdk";
import { ActionButton } from "../../action-button.js";
import { BackButton } from "../../back-button.js";
import { CreatorChip } from "../../creator-chip.js";
import { Input } from "../../input.js";
import { ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { ArtworkCanvas } from "./artwork-canvas.js";
import { AccessFields, FieldError, LicenseFields, SettingRow, SwitchRow, TimingFields } from "./drop-fields.js";
import { ExclusiveFields } from "./exclusive-fields.js";
import { LaunchDialog } from "./launch-dialog.js";
import { LICENSE_TYPES } from "../../../data/ip.js";
import { EMPTY_DRAFT, validateDropDraft, type DraftItem, type DropDraft } from "../../../utils/drop/draft.js";
import { MAX_DROP_SUPPLY } from "../../../utils/drop/metadata.js";
import { collectorPriceLine, type SaleDraft } from "../../../utils/drop/sale.js";
import { suggestLaunchpadSymbol } from "../../../utils/launchpad-defaults.js";
import { FIELD_LIMITS } from "../../../utils/field-limits.js";
import { useMedialaneApp } from "../../medialane-app.js";
import { useDropFee } from "../../../utils/use-drops.js";
import { useT } from "../../../i18n/provider.js";
import { useFormat } from "../../../i18n/use-format.js";

const toItem = (file: File): DraftItem => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), name: "", description: "" });

/** The images of a draft, in order. */
export function draftFiles(draft: DropDraft): File[] {
  return draft.kind === "edition" ? (draft.edition ? [draft.edition] : []) : draft.items.map((it) => it.file);
}

/** The draft with these images: one image is an edition, several are a collection. */
export function withArtwork(draft: DropDraft, files: File[]): Partial<DropDraft> {
  const current: DraftItem[] = draft.kind === "edition" ? (draft.edition ? [toItem(draft.edition)] : []) : draft.items;
  const items = [...current, ...files.map(toItem)];
  if (items.length === 1) return { kind: "edition", edition: items[0]!.file, items: [] };
  return { kind: "collection", edition: null, items };
}

/** The draft without this image; a single image left makes it an edition again. */
export function withoutArtwork(draft: DropDraft, file: File): Partial<DropDraft> {
  if (draft.kind === "edition") return { edition: null, cover: null };
  const items = draft.items.filter((it) => it.file !== file);
  if (items.length === 1) return { kind: "edition", edition: items[0]!.file, items: [], cover: null };
  return { items, cover: draft.cover === file ? null : draft.cover };
}

/** The collection's symbol, made from the drop's name. */
export function dropSymbol(name: string): string {
  return suggestLaunchpadSymbol(name) || "DROP";
}

type Row = "timing" | "access" | "license" | "exclusive";

/**
 * Create a drop by filling in the drop page itself: the artwork on the left, and on the right the
 * name, the description and one box with every term and the launch button.
 */
export function DropCreate() {
  const t = useT();
  const intl = useFormat();
  const app = useMedialaneApp();
  const feeBps = useDropFee();
  const [draft, setDraftState] = useState<DropDraft>(EMPTY_DRAFT);
  const [tried, setTried] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [open, setOpen] = useState<Row | null>(null);
  const setDraft = (patch: Partial<DropDraft>) => setDraftState((d) => ({ ...d, ...patch }));
  const setSale = (patch: Partial<SaleDraft>) => setDraftState((d) => ({ ...d, sale: { ...d.sale, ...patch } }));
  const errors = tried ? validateDropDraft(draft, Math.floor(Date.now() / 1000)) : {};
  const files = draftFiles(draft);
  const wallet = app.walletAddress;
  const sale = draft.sale;
  const priceLine = feeBps === null ? null : collectorPriceLine(sale, feeBps);
  const toggle = (row: Row) => setOpen((current) => (current === row ? null : row));

  const launch = () => {
    if (!wallet) return app.onRequireWallet();
    setTried(true);
    const invalid = validateDropDraft(draft, Math.floor(Date.now() / 1000));
    if (invalid.start || invalid.end || invalid.perWallet) setOpen("timing");
    else if (invalid.allowlist) setOpen("access");
    else if (invalid.gated) setOpen("exclusive");
    if (Object.keys(invalid).length === 0) setLaunching(true);
  };

  const timingValue = sale.startNow ? t("Starts at launch") : t("Scheduled start");
  const accessValue = draft.listOnly ? t("Invited wallets") : t("Everyone");
  const licenseValue = t(LICENSE_TYPES.find((l) => l.value === draft.license.licenseType)?.label ?? draft.license.licenseType);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20 sm:px-6">
      <BackButton />
      <header className="mt-6 max-w-2xl space-y-2">
        <h1 className="text-xl font-semibold">{t("Create a collection drop")}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("Release your work to collectors. You choose the price, how many are available and when the sale runs. Collectors mint straight from your drop page, and payments go to your wallet.")}
        </p>
      </header>
      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-2 lg:sticky lg:top-24 lg:self-start">
          <ArtworkCanvas
            files={files}
            cover={draft.cover}
            onAdd={(picked) => setDraftState((d) => ({ ...d, ...withArtwork(d, picked) }))}
            onRemove={(file) => setDraftState((d) => ({ ...d, ...withoutArtwork(d, file) }))}
            onCover={(file) => setDraft({ cover: file === files[0] ? null : file })}
          />
          <FieldError message={errors.artwork} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <input
              aria-label={t("Name")}
              value={draft.name}
              maxLength={FIELD_LIMITS.name}
              placeholder={t("Name your drop")}
              onChange={(e) => setDraft({ name: e.target.value, symbol: dropSymbol(e.target.value) })}
              className="w-full bg-transparent font-display text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40 sm:text-4xl"
            />
            <FieldError message={errors.name} />
            {wallet && <div className="-ml-2"><CreatorChip address={wallet} /></div>}
            <textarea
              aria-label={t("Description")}
              value={draft.description}
              maxLength={FIELD_LIMITS.description}
              rows={2}
              placeholder={t("Tell collectors about this drop")}
              onChange={(e) => {
                setDraft({ description: e.target.value });
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              className="w-full resize-none bg-transparent text-base leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="panel space-y-5 p-5">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("Price")}</p>
              <ToggleGroup value={sale.paid ? "Paid" : "Free"} options={["Free", "Paid"]} onChange={(v) => setSale({ paid: v === "Paid" })} />
              {sale.paid && (
                <div className="flex gap-2 pt-1">
                  <Input inputMode="decimal" aria-label={t("Price per token")} placeholder="0.00" value={sale.price}
                    onChange={(e) => setSale({ price: e.target.value.trim() })} className="text-lg font-semibold tabular-nums" />
                  <Select value={sale.tokenSymbol} onValueChange={(v) => setSale({ tokenSymbol: v })}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>{getListableTokens().map((token) => <SelectItem key={token.symbol} value={token.symbol}>{token.symbol}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {sale.paid && priceLine && <p className="text-xs text-muted-foreground">{priceLine}</p>}
              <FieldError message={errors.price} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{draft.kind === "collection" ? t("Pieces") : t("Copies")}</p>
                {draft.kind === "edition" && (
                  <p className="text-xs text-muted-foreground">{t("Up to {MAX_DROP_SUPPLY}", { MAX_DROP_SUPPLY: intl.number(MAX_DROP_SUPPLY) })}</p>
                )}
              </div>
              {draft.kind === "collection" ? (
                <span className="text-lg font-semibold tabular-nums">{intl.number(draft.items.length)}</span>
              ) : (
                <Input inputMode="numeric" aria-label={t("Copies")} value={draft.supply} onChange={(e) => setDraft({ supply: e.target.value.trim() })}
                  className="w-24 text-right text-lg font-semibold tabular-nums" />
              )}
            </div>
            <FieldError message={errors.supply} />

            <div>
              <SettingRow label={t("Timing")} value={timingValue} open={open === "timing"} onToggle={() => toggle("timing")}
                invalid={!!(errors.start || errors.end || errors.perWallet)}>
                <TimingFields draft={draft} setDraft={setDraft} errors={errors} />
              </SettingRow>
              <SettingRow label={t("Who can mint")} value={accessValue} open={open === "access"} onToggle={() => toggle("access")}
                invalid={!!errors.allowlist}>
                <AccessFields draft={draft} setDraft={setDraft} errors={errors} />
              </SettingRow>
              <SettingRow label={t("License")} value={licenseValue} open={open === "license"} onToggle={() => toggle("license")}>
                <LicenseFields draft={draft} setDraft={setDraft} />
              </SettingRow>
              <SettingRow label={t("Exclusive content")} value={draft.gated.enabled ? t("On") : t("Off")} open={open === "exclusive"}
                onToggle={() => toggle("exclusive")} invalid={!!errors.gated}>
                <SwitchRow label={t("A private link only holders can open")} checked={draft.gated.enabled}
                  onChange={(enabled) => setDraft({ gated: { ...draft.gated, enabled } })} />
                {draft.gated.enabled && <ExclusiveFields value={draft.gated} onChange={(v) => setDraft({ gated: { ...draft.gated, ...v } })} />}
                <FieldError message={errors.gated} />
              </SettingRow>
            </div>

            {tried && Object.keys(errors).length > 0 && <p className="text-sm font-medium text-destructive">{t("Check the highlighted fields.")}</p>}
            <ActionButton solid big onClick={launch} className="w-full">
              {wallet ? t("Launch drop") : app.connectLabel ?? t("Sign in to launch")}
            </ActionButton>
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />{t("Artwork, price and copies can't change after launch.")}
            </p>
          </div>
        </div>
      </div>
      {launching && <LaunchDialog open onClose={() => setLaunching(false)} draft={draft} />}
    </div>
  );
}
