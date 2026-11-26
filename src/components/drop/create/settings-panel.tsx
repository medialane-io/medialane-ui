"use client";

import { useState } from "react";
import { Lock, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { CollapsibleSection } from "../../collapsible-section.js";
import { DropPanel, type PanelProps } from "./drop-panel.js";
import { AccessFields, FieldError, LicenseFields, PriceFields, TimingFields } from "./drop-fields.js";
import { ExclusiveFields } from "./exclusive-fields.js";
import { salePriceLabel } from "../../../utils/drop/sale.js";
import { useDropFee } from "../../../utils/use-drops.js";
import { useT } from "../../../i18n/provider.js";
import { useFormat } from "../../../i18n/use-format.js";

export function SettingsPanel({ draft, setDraft, errors, open, onToggle }: PanelProps) {
  const t = useT();
  const intl = useFormat();
  const feeBps = useDropFee();
  const [licenseOpen, setLicenseOpen] = useState(false);
  const settings = errors.settings;
  const sale = draft.sale;
  const priceText = salePriceLabel(sale);
  const price = priceText ? t(priceText) : t("Set a price");
  const startMs = sale.startNow || !sale.start ? NaN : new Date(sale.start).getTime();
  const start = Number.isNaN(startMs) ? t("Starts at launch") : t("Starts {date}", { date: intl.dateTime(new Date(startMs)) });
  const fields = { draft, setDraft, errors: settings };

  return (
    <DropPanel
      icon={<SlidersHorizontal />}
      title={t("Drop settings")}
      open={open}
      onToggle={onToggle}
      error={Object.values(settings).find(Boolean)}
      summary={
        <span className="block space-y-0.5">
          <span className="block">{price}</span>
          <span className="block">{start}</span>
          {draft.listOnly && <span className="block">{t("Wallet list")}</span>}
        </span>
      }
    >
      <PriceFields {...fields} feeBps={feeBps} />
      <TimingFields {...fields} />
      <AccessFields {...fields} />
      <CollapsibleSection open={licenseOpen} onOpenChange={setLicenseOpen}
        icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
        label={t("License terms")} hint={t("For every NFT")}>
        <LicenseFields draft={draft} setDraft={setDraft} />
      </CollapsibleSection>
      <CollapsibleSection open={draft.gated.enabled}
        onOpenChange={(enabled) => setDraft({ gated: { ...draft.gated, enabled } })}
        icon={<Lock className="h-4 w-4 text-muted-foreground" />}
        label={t("Exclusive content")} hint={t("A private link for holders")}>
        <ExclusiveFields value={draft.gated} onChange={(v) => setDraft({ gated: { ...draft.gated, ...v } })} />
        <FieldError message={settings.gated} />
      </CollapsibleSection>
    </DropPanel>
  );
}
