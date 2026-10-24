"use client";

import { FileText } from "lucide-react";
import { FIELD_LIMITS } from "../../../utils/field-limits.js";
import { Input } from "../../input.js";
import { Textarea } from "../../textarea.js";
import { Section, ToggleGroup } from "../../create-form-primitives.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { AI_POLICIES, DERIVATIVES_OPTIONS, IP_TYPES, LICENSE_TYPES } from "../../../data/ip.js";
import { suggestLaunchpadSymbol } from "../../../utils/launchpad-defaults.js";
import { FieldError, ImagePick, type SectionProps } from "./artwork-section.js";

export function DetailsSection({ draft, setDraft, errors }: SectionProps) {
  const license = draft.license;
  const setLicense = (patch: Partial<typeof license>) => setDraft({ license: { ...license, ...patch } });
  return (
    <Section title="Details" icon={<FileText className="h-4 w-4" />}>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Cover image <span className="font-normal text-muted-foreground">(optional — the artwork is used otherwise)</span></p>
        <ImagePick file={draft.cover} onPick={(f) => setDraft({ cover: f })} label="Choose a cover" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="drop-name">Name</label>
        <Input id="drop-name" value={draft.name} maxLength={FIELD_LIMITS.name}
          onChange={(e) => {
            const name = e.target.value;
            const auto = !draft.symbol || draft.symbol === suggestLaunchpadSymbol(draft.name);
            setDraft(auto ? { name, symbol: suggestLaunchpadSymbol(name) } : { name });
          }} />
        <FieldError message={errors.name} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="drop-symbol">Symbol</label>
        <Input id="drop-symbol" value={draft.symbol} maxLength={FIELD_LIMITS.symbol} className="max-w-[10rem] uppercase"
          onChange={(e) => setDraft({ symbol: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} />
        <FieldError message={errors.symbol} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="drop-description">Description</label>
        <Textarea id="drop-description" value={draft.description} maxLength={FIELD_LIMITS.description} rows={3} onChange={(e) => setDraft({ description: e.target.value })} />
      </div>
      <div className="space-y-3 border-t border-border/60 pt-4">
        <p className="text-sm font-medium">License <span className="font-normal text-muted-foreground">— saved with every token</span></p>
        <Select value={license.licenseType} onValueChange={(v) => {
          const def = LICENSE_TYPES.find((l) => l.value === v);
          setLicense(def ? { licenseType: v, commercialUse: def.commercialUse, derivatives: def.derivatives, attribution: def.attribution } : { licenseType: v });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
        </Select>
        <p className="text-xs font-medium">Commercial use</p>
        <ToggleGroup value={license.commercialUse} options={["Yes", "No"]} onChange={(v) => setLicense({ commercialUse: v })} />
        <p className="text-xs font-medium">Remixing</p>
        <ToggleGroup value={license.derivatives} options={DERIVATIVES_OPTIONS} onChange={(v) => setLicense({ derivatives: v })} />
        <p className="text-xs font-medium">AI training</p>
        <ToggleGroup value={license.aiPolicy} options={AI_POLICIES} onChange={(v) => setLicense({ aiPolicy: v })} />
        <p className="text-xs font-medium">Type</p>
        <Select value={license.ipType} onValueChange={(v) => setLicense({ ipType: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{IP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </Section>
  );
}
