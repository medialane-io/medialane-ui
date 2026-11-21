"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { getListableTokens } from "@medialane/sdk";
import Image from "../../image.js";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { Textarea } from "../../textarea.js";
import { Switch } from "../../switch.js";
import { ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { DropItemList } from "../../drop-item-list.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES } from "../../../data/ip.js";
import { MAX_DROP_SUPPLY } from "../../../utils/drop/metadata.js";
import type { DropDraft, DropDraftErrors } from "../../../utils/drop/draft.js";
import { collectorPriceLine, type SaleDraft } from "../../../utils/drop/sale.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { acceptFor } from "../../../utils/upload-limits.js";
import { FIELD_LIMITS } from "../../../utils/field-limits.js";
import { useT } from "../../../i18n/provider.js";
import { useFormat } from "../../../i18n/use-format.js";

export interface FieldsProps {
  draft: DropDraft;
  setDraft: (patch: Partial<DropDraft>) => void;
  errors: DropDraftErrors;
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

/**
 * The artwork once chosen: one image is an edition with a number of copies; several images are a
 * collection where each image is its own token.
 */
export function ArtworkFields({ draft, setDraft, errors, onAddFiles, onRemoveEdition }: FieldsProps & {
  onAddFiles: (files: File[]) => void;
  onRemoveEdition: () => void;
}) {
  const t = useT();
  const intl = useFormat();
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (draft.kind === "collection") {
    return (
      <div className="space-y-2">
        <DropItemList
          items={draft.items}
          collectionName={draft.name}
          onAddFiles={onAddFiles}
          onRemove={(id) => setDraft({ items: draft.items.filter((it) => it.id !== id) })}
          onEdit={(id, patch) => setDraft({ items: draft.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })}
        />
        <FieldError message={errors.artwork} />
      </div>
    );
  }

  const preview = draft.edition ? previewUrl(draft.edition) : null;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {preview && <Image src={preview} alt={draft.edition?.name ?? ""} fill unoptimized className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{draft.edition?.name}</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ImagePlus className="h-3.5 w-3.5" />{t("Add more images")}
          </button>
          <input ref={inputRef} type="file" accept={acceptFor("image")} multiple className="hidden"
            onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) onAddFiles(files); e.target.value = ""; }} />
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemoveEdition} aria-label={t("Remove")}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Field label={t("Copies")} htmlFor="drop-supply">
        <Input id="drop-supply" inputMode="numeric" value={draft.supply} onChange={(e) => setDraft({ supply: e.target.value.trim() })} className="max-w-[10rem]" />
        <p className="text-xs text-muted-foreground">{t("Up to {MAX_DROP_SUPPLY}.", { MAX_DROP_SUPPLY: intl.number(MAX_DROP_SUPPLY) })}</p>
        <FieldError message={errors.supply} />
      </Field>
    </div>
  );
}

export function NameFields({ draft, setDraft, errors, onNameChange }: FieldsProps & { onNameChange: (name: string) => void }) {
  const t = useT();
  return (
    <>
      <Field label={t("Name")} htmlFor="drop-name">
        <Input id="drop-name" value={draft.name} maxLength={FIELD_LIMITS.name} placeholder={t("My drop")} onChange={(e) => onNameChange(e.target.value)} />
        <FieldError message={errors.name ?? errors.symbol} />
      </Field>
      <Field label={t("Description")} htmlFor="drop-description">
        <Textarea id="drop-description" value={draft.description} maxLength={FIELD_LIMITS.description} rows={3}
          placeholder={t("What collectors get and the story behind it")}
          onChange={(e) => setDraft({ description: e.target.value })} />
      </Field>
    </>
  );
}

export function PriceFields({ draft, setDraft, errors, feeBps }: FieldsProps & { feeBps: number | null }) {
  const t = useT();
  const sale = draft.sale;
  const set = (patch: Partial<SaleDraft>) => setDraft({ sale: { ...sale, ...patch } });
  const line = feeBps === null ? null : collectorPriceLine(sale, feeBps);
  return (
    <Field label={t("Price")}>
      <ToggleGroup value={sale.paid ? "Paid" : "Free"} options={["Free", "Paid"]} onChange={(v) => set({ paid: v === "Paid" })} />
      {sale.paid && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input inputMode="decimal" placeholder={t("Price per token")} value={sale.price} onChange={(e) => set({ price: e.target.value.trim() })} />
            <Select value={sale.tokenSymbol} onValueChange={(v) => set({ tokenSymbol: v })}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{getListableTokens().map((token) => <SelectItem key={token.symbol} value={token.symbol}>{token.symbol}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {line && <p className="text-xs text-muted-foreground">{line}</p>}
          <FieldError message={errors.price} />
        </div>
      )}
    </Field>
  );
}

export function AccessFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const parsed = draft.listOnly ? parseAllowlist(draft.allowlist) : null;
  return (
    <Field label={t("Who can mint")}>
      <ToggleGroup value={draft.listOnly ? "A list" : "Everyone"} options={["Everyone", "A list"]} onChange={(v) => setDraft({ listOnly: v === "A list" })} />
      {draft.listOnly && (
        <div className="space-y-2">
          <Textarea rows={5} placeholder={t("Paste wallet addresses, one per line")} value={draft.allowlist} onChange={(e) => setDraft({ allowlist: e.target.value })} />
          <label className="inline-block cursor-pointer text-xs font-semibold text-primary">
            {t("Upload a CSV")}
            <input type="file" accept=".csv,text/csv,text/plain" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) setDraft({ allowlist: await f.text() }); }} />
          </label>
          {parsed && (
            <p className="text-xs text-muted-foreground">
              {t.plural("{count} wallet", "{count} wallets", parsed.addresses.length)}
              {parsed.duplicates.length > 0 && ` · ${t.plural("{count} duplicate skipped", "{count} duplicates skipped", parsed.duplicates.length)}`}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t("After launch you get a claim link for each wallet to share.")}</p>
          <FieldError message={errors.allowlist} />
        </div>
      )}
    </Field>
  );
}

/** One line for the timing panel while it is closed. */
export function timingSummary(sale: SaleDraft, t: ReturnType<typeof useT>): string {
  return [
    sale.startNow ? t("Starts at launch") : t("Scheduled start"),
    sale.hasEnd ? t("Has an end date") : t("No end date"),
    sale.limitPerWallet && sale.perWallet ? t("{count} per wallet", { count: sale.perWallet }) : t("No limit per wallet"),
  ].join(" · ");
}

export function TimingFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const sale = draft.sale;
  const set = (patch: Partial<SaleDraft>) => setDraft({ sale: { ...sale, ...patch } });
  return (
    <div className="space-y-4">
      <SwitchRow label={t("Starts now")} checked={sale.startNow} onChange={(v) => set({ startNow: v })} />
      {!sale.startNow && (
        <div className="space-y-1.5">
          <Input type="datetime-local" value={sale.start} onChange={(e) => set({ start: e.target.value })} />
          <FieldError message={errors.start} />
        </div>
      )}
      <SwitchRow label={t("Has an end date")} checked={sale.hasEnd} onChange={(v) => set({ hasEnd: v })} />
      {sale.hasEnd && (
        <div className="space-y-1.5">
          <Input type="datetime-local" value={sale.end} onChange={(e) => set({ end: e.target.value })} />
          <FieldError message={errors.end} />
        </div>
      )}
      <SwitchRow label={t("Limit per wallet")} checked={sale.limitPerWallet} onChange={(v) => set({ limitPerWallet: v })} />
      {sale.limitPerWallet && (
        <div className="space-y-1.5">
          <Input inputMode="numeric" className="max-w-[10rem]" value={sale.perWallet} onChange={(e) => set({ perWallet: e.target.value.trim() })} />
          <FieldError message={errors.perWallet} />
        </div>
      )}
    </div>
  );
}

export function LicenseFields({ draft, setDraft }: Omit<FieldsProps, "errors">) {
  const t = useT();
  const license = draft.license;
  const set = (patch: Partial<typeof license>) => setDraft({ license: { ...license, ...patch } });
  return (
    <div className="space-y-4">
      <Field label={t("License")}>
        <Select value={license.licenseType} onValueChange={(v) => {
          const def = LICENSE_TYPES.find((l) => l.value === v);
          set(def ? { licenseType: v, commercialUse: def.commercialUse, derivatives: def.derivatives, attribution: def.attribution } : { licenseType: v });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{t(l.label)}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label={t("Commercial use")}>
        <ToggleGroup value={license.commercialUse} options={["Yes", "No"]} onChange={(v) => set({ commercialUse: v })} />
      </Field>
      <Field label={t("Remixing")}>
        <ToggleGroup value={license.derivatives} options={DERIVATIVES_OPTIONS} onChange={(v) => set({ derivatives: v })} />
      </Field>
      <Field label={t("AI training")}>
        <ToggleGroup value={license.aiPolicy} options={AI_POLICIES} onChange={(v) => set({ aiPolicy: v })} />
      </Field>
      <Field label={t("Type")}>
        <Select value={license.ipType} onValueChange={(v) => set({ ipType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{IP_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
