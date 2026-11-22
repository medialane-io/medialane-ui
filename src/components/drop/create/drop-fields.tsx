"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { getListableTokens } from "@medialane/sdk";
import Image from "../../image.js";
import { Input } from "../../input.js";
import { Label } from "../../label.js";
import { Textarea } from "../../textarea.js";
import { Switch } from "../../switch.js";
import { ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES } from "../../../data/ip.js";
import { MAX_DROP_SUPPLY } from "../../../utils/drop/metadata.js";
import type { DropDraft, DropDraftErrors } from "../../../utils/drop/draft.js";
import { collectorPriceLine, type SaleDraft } from "../../../utils/drop/sale.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { previewUrl } from "../../../utils/drop/preview.js";
import { acceptFor, uploadError } from "../../../utils/upload-limits.js";
import { FIELD_LIMITS } from "../../../utils/field-limits.js";
import { useT } from "../../../i18n/provider.js";
import { useFormat } from "../../../i18n/use-format.js";

export interface FieldsProps {
  draft: DropDraft;
  setDraft: (patch: Partial<DropDraft>) => void;
  errors: DropDraftErrors;
}

export function FieldError({ message }: { message?: string }) {
  const t = useT();
  return message ? <p role="alert" className="text-sm text-destructive">{t(message)}</p> : null;
}

export function Field({ label, htmlFor, children }: { label: React.ReactNode; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function ArtworkUpload({ files, onAdd, onRemove, error }: {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (file: File) => void;
  error?: string;
}) {
  const t = useT();
  const ref = useRef<HTMLInputElement | null>(null);
  const open = () => ref.current?.click();
  return (
    <Field label={t("Artwork *")}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t("Upload images")}
        onClick={open}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm">{t("Click to upload an image")}</p>
          </div>
        ) : files.length === 1 ? (
          <Thumb file={files[0]!} className="mx-auto h-48 w-48" onRemove={() => onRemove(files[0]!)} />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {files.map((file, i) => <Thumb key={`${file.name}-${i}`} file={file} className="aspect-square w-full" onRemove={() => onRemove(file)} />)}
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept={acceptFor("image")}
          multiple
          className="hidden"
          data-testid="artwork-input"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []).filter((f) => !uploadError(f, "image"));
            if (picked.length) onAdd(picked);
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {files.length === 1 ? t("Add more images to make a set of unique pieces.") : t.plural("{count} unique piece", "{count} unique pieces", files.length)}
        </p>
      )}
      <FieldError message={error} />
    </Field>
  );
}

function Thumb({ file, className, onRemove }: { file: File; className: string; onRemove: () => void }) {
  const t = useT();
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-muted ${className}`}>
      <Image src={previewUrl(file)} alt={file.name} fill unoptimized className="object-cover" />
      <button type="button" aria-label={t("Remove")}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-background/85 text-foreground hover:bg-background">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function NameFields({ draft, setDraft, errors, onNameChange }: FieldsProps & { onNameChange: (name: string) => void }) {
  const t = useT();
  return (
    <>
      <Field label={t("Name *")} htmlFor="drop-name">
        <Input id="drop-name" value={draft.name} maxLength={FIELD_LIMITS.name} placeholder={t("My Creative Work")} onChange={(e) => onNameChange(e.target.value)} />
        <FieldError message={errors.name ?? errors.symbol} />
      </Field>
      <Field label={t("Description")} htmlFor="drop-description">
        <Textarea id="drop-description" value={draft.description} maxLength={FIELD_LIMITS.description} rows={4}
          placeholder={t("The story behind the work…")}
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
        <div className="flex gap-2">
          <Input inputMode="decimal" aria-label={t("Price per token")} placeholder={t("Price per token")} value={sale.price} onChange={(e) => set({ price: e.target.value.trim() })} />
          <Select value={sale.tokenSymbol} onValueChange={(v) => set({ tokenSymbol: v })}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{getListableTokens().map((token) => <SelectItem key={token.symbol} value={token.symbol}>{token.symbol}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
      {sale.paid && line && <p className="text-xs text-muted-foreground">{line}</p>}
      <FieldError message={errors.price} />
    </Field>
  );
}

export function CopiesField({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const intl = useFormat();
  return (
    <Field label={t("Copies")} htmlFor="drop-supply">
      <Input id="drop-supply" inputMode="numeric" value={draft.supply} onChange={(e) => setDraft({ supply: e.target.value.trim() })} className="max-w-[10rem]" />
      <p className="text-xs text-muted-foreground">{t("Up to {MAX_DROP_SUPPLY}.", { MAX_DROP_SUPPLY: intl.number(MAX_DROP_SUPPLY) })}</p>
      <FieldError message={errors.supply} />
    </Field>
  );
}

export function AccessFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const parsed = draft.listOnly ? parseAllowlist(draft.allowlist) : null;
  return (
    <Field label={t("Who can mint")}>
      <ToggleGroup value={draft.listOnly ? "Invited wallets" : "Everyone"} options={["Everyone", "Invited wallets"]}
        onChange={(v) => setDraft({ listOnly: v === "Invited wallets" })} />
      {draft.listOnly && (
        <div className="space-y-2">
          <Textarea rows={5} placeholder={t("One wallet address per line")} value={draft.allowlist} onChange={(e) => setDraft({ allowlist: e.target.value })} />
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

export function TimingFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const sale = draft.sale;
  const set = (patch: Partial<SaleDraft>) => setDraft({ sale: { ...sale, ...patch } });
  return (
    <Field label={t("Timing")}>
      <div className="space-y-3">
        <SwitchRow label={t("Starts now")} checked={sale.startNow} onChange={(v) => set({ startNow: v })} />
        {!sale.startNow && (
          <div className="space-y-1.5">
            <Input type="datetime-local" aria-label={t("Start")} value={sale.start} onChange={(e) => set({ start: e.target.value })} />
            <FieldError message={errors.start} />
          </div>
        )}
        <SwitchRow label={t("Has an end date")} checked={sale.hasEnd} onChange={(v) => set({ hasEnd: v })} />
        {sale.hasEnd && (
          <div className="space-y-1.5">
            <Input type="datetime-local" aria-label={t("End")} value={sale.end} onChange={(e) => set({ end: e.target.value })} />
            <FieldError message={errors.end} />
          </div>
        )}
        <SwitchRow label={t("Limit per wallet")} checked={sale.limitPerWallet} onChange={(v) => set({ limitPerWallet: v })} />
        {sale.limitPerWallet && (
          <div className="space-y-1.5">
            <Input inputMode="numeric" aria-label={t("Limit per wallet")} className="max-w-[10rem]" value={sale.perWallet} onChange={(e) => set({ perWallet: e.target.value.trim() })} />
            <FieldError message={errors.perWallet} />
          </div>
        )}
      </div>
    </Field>
  );
}

export function LicenseFields({ draft, setDraft }: Omit<FieldsProps, "errors">) {
  const t = useT();
  const license = draft.license;
  const set = (patch: Partial<typeof license>) => setDraft({ license: { ...license, ...patch } });
  const def = LICENSE_TYPES.find((l) => l.value === license.licenseType);
  return (
    <>
      <p className="text-xs text-muted-foreground">{t("Set how collectors use the work.")}</p>
      <Field label={t("License")}>
        <Select value={license.licenseType} onValueChange={(v) => {
          const next = LICENSE_TYPES.find((l) => l.value === v);
          set(next ? { licenseType: v, commercialUse: next.commercialUse, derivatives: next.derivatives, attribution: next.attribution } : { licenseType: v });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{t(l.label)}</SelectItem>)}</SelectContent>
        </Select>
        {def && <p className="text-xs text-muted-foreground">{t(def.description)}</p>}
      </Field>
      <Field label={t("Commercial use")}>
        <ToggleGroup value={license.commercialUse} options={["Yes", "No"]} onChange={(v) => set({ commercialUse: v })} />
      </Field>
      <Field label={t("Derivatives")}>
        <ToggleGroup value={license.derivatives} options={DERIVATIVES_OPTIONS} onChange={(v) => set({ derivatives: v })} />
      </Field>
      <Field label={t("AI & data mining")}>
        <ToggleGroup value={license.aiPolicy} options={AI_POLICIES} onChange={(v) => set({ aiPolicy: v })} />
      </Field>
      <Field label={t("IP type")}>
        <Select value={license.ipType} onValueChange={(v) => set({ ipType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{IP_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
    </>
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
