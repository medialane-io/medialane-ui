"use client";

import { ChevronDown } from "lucide-react";
import { Input } from "../../input.js";
import { Textarea } from "../../textarea.js";
import { Switch } from "../../switch.js";
import { ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES } from "../../../data/ip.js";
import type { DropDraft, DropDraftErrors } from "../../../utils/drop/draft.js";
import type { SaleDraft } from "../../../utils/drop/sale.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { cn } from "../../../utils/cn.js";
import { useT } from "../../../i18n/provider.js";

export interface FieldsProps {
  draft: DropDraft;
  setDraft: (patch: Partial<DropDraft>) => void;
  errors: DropDraftErrors;
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}

/** A setting as one line with its current value; opens its controls in place. */
export function SettingRow({ label, value, open, onToggle, invalid, children }: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border/60">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-3.5 text-left">
        <span className={cn("text-sm font-medium", invalid && "text-destructive")}>{label}</span>
        <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <span className="truncate">{value}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
        </span>
      </button>
      {open && <div className="space-y-4 pb-5">{children}</div>}
    </div>
  );
}

export function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function AccessFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const parsed = draft.listOnly ? parseAllowlist(draft.allowlist) : null;
  return (
    <>
      <ToggleGroup value={draft.listOnly ? "Invited wallets" : "Everyone"} options={["Everyone", "Invited wallets"]}
        onChange={(v) => setDraft({ listOnly: v === "Invited wallets" })} />
      {draft.listOnly && (
        <div className="space-y-2">
          <Textarea rows={5} placeholder={t("Paste wallet addresses, one per line")} value={draft.allowlist} onChange={(e) => setDraft({ allowlist: e.target.value })} />
          <div className="flex items-center justify-between gap-3">
            <label className="cursor-pointer text-xs font-semibold text-primary">
              {t("Upload a CSV")}
              <input type="file" accept=".csv,text/csv,text/plain" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) setDraft({ allowlist: await f.text() }); }} />
            </label>
            {parsed && (
              <span className="text-xs text-muted-foreground">
                {t.plural("{count} wallet", "{count} wallets", parsed.addresses.length)}
                {parsed.duplicates.length > 0 && ` · ${t.plural("{count} duplicate skipped", "{count} duplicates skipped", parsed.duplicates.length)}`}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("After launch you get a claim link for each wallet to share.")}</p>
          <FieldError message={errors.allowlist} />
        </div>
      )}
    </>
  );
}

export function TimingFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const sale = draft.sale;
  const set = (patch: Partial<SaleDraft>) => setDraft({ sale: { ...sale, ...patch } });
  return (
    <>
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
    </>
  );
}

export function LicenseFields({ draft, setDraft }: Omit<FieldsProps, "errors">) {
  const t = useT();
  const license = draft.license;
  const set = (patch: Partial<typeof license>) => setDraft({ license: { ...license, ...patch } });
  return (
    <>
      <Labeled label={t("License")}>
        <Select value={license.licenseType} onValueChange={(v) => {
          const def = LICENSE_TYPES.find((l) => l.value === v);
          set(def ? { licenseType: v, commercialUse: def.commercialUse, derivatives: def.derivatives, attribution: def.attribution } : { licenseType: v });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{t(l.label)}</SelectItem>)}</SelectContent>
        </Select>
      </Labeled>
      <Labeled label={t("Commercial use")}>
        <ToggleGroup value={license.commercialUse} options={["Yes", "No"]} onChange={(v) => set({ commercialUse: v })} />
      </Labeled>
      <Labeled label={t("Remixing")}>
        <ToggleGroup value={license.derivatives} options={DERIVATIVES_OPTIONS} onChange={(v) => set({ derivatives: v })} />
      </Labeled>
      <Labeled label={t("AI training")}>
        <ToggleGroup value={license.aiPolicy} options={AI_POLICIES} onChange={(v) => set({ aiPolicy: v })} />
      </Labeled>
      <Labeled label={t("Type")}>
        <Select value={license.ipType} onValueChange={(v) => set({ ipType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{IP_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
        </Select>
      </Labeled>
    </>
  );
}
