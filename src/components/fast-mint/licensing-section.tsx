"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { Input } from "../input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible.js";
import { LICENSE_TYPES, GEOGRAPHIC_SCOPES, AI_POLICIES, DERIVATIVES_OPTIONS } from "../../data/ip.js";
import { cn } from "../../utils/cn.js";
import type { FormValues } from "./form.js";

export function ToggleGroup({
  value, options, onChange,
}: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden w-full">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 px-3 py-2 text-sm transition-colors",
            i > 0 && "border-l border-border",
            value === opt ? "bg-primary text-primary-foreground font-medium" : "bg-background hover:bg-muted text-muted-foreground"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function LicensingSection({ form }: { form: UseFormReturn<FormValues> }) {
  const [open, setOpen] = useState(false);

  const handleLicenseChange = (value: string) => {
    form.setValue("licenseType", value);
    const def = LICENSE_TYPES.find((l) => l.value === value);
    if (def) {
      form.setValue("commercialUse", def.commercialUse);
      form.setValue("derivatives", def.derivatives);
      form.setValue("attribution", def.attribution);
    }
  };

  return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-xl border border-border overflow-hidden">
          <CollapsibleTrigger asChild>
            <button type="button" className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Licensing Terms</span>
                <span className="text-xs text-muted-foreground font-normal">Optional · Berne Convention</span>
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">License</label>
                <Select value={form.watch("licenseType")} onValueChange={handleLicenseChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Commercial use</label>
                <ToggleGroup value={form.watch("commercialUse")} options={["Yes", "No"]} onChange={(v) => form.setValue("commercialUse", v as "Yes" | "No")} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Derivatives</label>
                <ToggleGroup value={form.watch("derivatives")} options={DERIVATIVES_OPTIONS} onChange={(v) => form.setValue("derivatives", v as FormValues["derivatives"])} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Territory</label>
                <Select value={form.watch("geographicScope")} onValueChange={(v) => form.setValue("geographicScope", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GEOGRAPHIC_SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">AI &amp; data mining</label>
                <ToggleGroup value={form.watch("aiPolicy")} options={AI_POLICIES} onChange={(v) => form.setValue("aiPolicy", v as FormValues["aiPolicy"])} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Royalty % (0–50)</label>
                <Input
                  type="number" min={0} max={50} step={0.5}
                  value={form.watch("royalty")}
                  onChange={(e) => form.setValue("royalty", parseFloat(e.target.value) || 0)}
                  className="max-w-[120px]"
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
  );
}
