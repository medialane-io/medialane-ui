"use client";

import { getListableTokens } from "@medialane/sdk";
import { Input } from "../../input.js";
import { Label } from "../../label.js";
import { Textarea } from "../../textarea.js";
import { ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES } from "../../../data/ip.js";
import type { DropDraft, DropDraftErrors } from "../../../utils/drop/draft.js";
import { collectorPriceLine, type SaleDraft } from "../../../utils/drop/sale.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { useT } from "../../../i18n/provider.js";
import type { Phrase } from "../../../i18n/translate.js";

export interface FieldsProps {
  draft: DropDraft;
  setDraft: (patch: Partial<DropDraft>) => void;
  errors: DropDraftErrors["settings"];
}

export function FieldError({ message }: { message?: Phrase | null }) {
  const t = useT();
  return message ? <p role="alert" className="text-sm text-destructive">{t(message.text, message.vars)}</p> : null;
}

export function Field({ label, htmlFor, children }: { label: React.ReactNode; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
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
      {sale.paid && line && <p className="text-xs text-muted-foreground">{t(line.text, line.vars)}</p>}
      <FieldError message={errors.price} />
    </Field>
  );
}

export function AccessFields({ draft, setDraft, errors }: FieldsProps) {
  const t = useT();
  const parsed = draft.listOnly ? parseAllowlist(draft.allowlist) : null;
  return (
    <Field label={t("Who can mint")}>
      <ToggleGroup value={draft.listOnly ? "Wallet list" : "Everyone"} options={["Everyone", "Wallet list"]}
        onChange={(v) => setDraft({ listOnly: v === "Wallet list" })} />
      {draft.listOnly && (
        <div className="space-y-2">
          <Textarea rows={5} aria-label={t("Wallet list")} placeholder={t("One wallet address per line")} value={draft.allowlist} onChange={(e) => setDraft({ allowlist: e.target.value })} />
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
          <p className="text-xs text-muted-foreground">{t("Each wallet gets a claim link after launch.")}</p>
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
    <>
      <Field label={t("Starts")}>
        <ToggleGroup value={sale.startNow ? "At launch" : "Pick a date"} options={["At launch", "Pick a date"]}
          onChange={(v) => set({ startNow: v === "At launch" })} />
        {!sale.startNow && <Input type="datetime-local" aria-label={t("Start")} value={sale.start} onChange={(e) => set({ start: e.target.value })} />}
        <FieldError message={errors.start} />
      </Field>
      <Field label={t("Ends")}>
        <ToggleGroup value={sale.hasEnd ? "Pick a date" : "No end"} options={["No end", "Pick a date"]}
          onChange={(v) => set({ hasEnd: v === "Pick a date" })} />
        {sale.hasEnd && <Input type="datetime-local" aria-label={t("End")} value={sale.end} onChange={(e) => set({ end: e.target.value })} />}
        <FieldError message={errors.end} />
      </Field>
      <Field label={t("Limit per wallet")}>
        <ToggleGroup value={sale.limitPerWallet ? "Set a limit" : "No limit"} options={["No limit", "Set a limit"]}
          onChange={(v) => set({ limitPerWallet: v === "Set a limit" })} />
        {sale.limitPerWallet && <Input inputMode="numeric" aria-label={t("Tokens per wallet")} className="max-w-[10rem]" value={sale.perWallet} onChange={(e) => set({ perWallet: e.target.value.trim() })} />}
        <FieldError message={errors.perWallet} />
      </Field>
    </>
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
