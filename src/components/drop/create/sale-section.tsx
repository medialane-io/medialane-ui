"use client";

import { Tag } from "lucide-react";
import { getListableTokens, type ResolvedFeeConfig } from "@medialane/sdk";
import { Input } from "../../input.js";
import { Switch } from "../../switch.js";
import { Section, ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { collectorPriceLine, type SaleDraft } from "../../../utils/drop/sale.js";
import { FieldError, type SectionProps } from "./artwork-section.js";

export function SaleSection({ draft, setDraft, errors, feeConfig }: SectionProps & { feeConfig: ResolvedFeeConfig }) {
  const sale = draft.sale;
  const set = (patch: Partial<SaleDraft>) => setDraft({ sale: { ...sale, ...patch } });
  const line = collectorPriceLine(sale, feeConfig);
  return (
    <Section title="Sale" icon={<Tag className="h-4 w-4" />}>
      <ToggleGroup value={sale.paid ? "Paid" : "Free"} options={["Free", "Paid"]} onChange={(v) => set({ paid: v === "Paid" })} />
      {sale.paid && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input inputMode="decimal" placeholder="Price per token" value={sale.price} onChange={(e) => set({ price: e.target.value.trim() })} />
            <Select value={sale.tokenSymbol} onValueChange={(v) => set({ tokenSymbol: v })}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{getListableTokens().map((t) => <SelectItem key={t.symbol} value={t.symbol}>{t.symbol}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {line && <p className="text-xs text-muted-foreground">{line}</p>}
          <FieldError message={errors.price} />
        </div>
      )}
      <Toggle label="Starts now" checked={sale.startNow} onChange={(v) => set({ startNow: v })} />
      {!sale.startNow && (
        <div className="space-y-1.5">
          <Input type="datetime-local" value={sale.start} onChange={(e) => set({ start: e.target.value })} />
          <FieldError message={errors.start} />
        </div>
      )}
      <Toggle label="Has an end date" checked={sale.hasEnd} onChange={(v) => set({ hasEnd: v })} />
      {sale.hasEnd && (
        <div className="space-y-1.5">
          <Input type="datetime-local" value={sale.end} onChange={(e) => set({ end: e.target.value })} />
          <FieldError message={errors.end} />
        </div>
      )}
      <Toggle label="Limit per wallet" checked={sale.limitPerWallet} onChange={(v) => set({ limitPerWallet: v })} />
      {sale.limitPerWallet && (
        <div className="space-y-1.5">
          <Input inputMode="numeric" className="max-w-[10rem]" value={sale.perWallet} onChange={(e) => set({ perWallet: e.target.value.trim() })} />
          <FieldError message={errors.perWallet} />
        </div>
      )}
    </Section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
