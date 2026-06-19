"use client";

import { Bot, Calendar, DollarSign, GitBranch, Globe, Percent, ShieldCheck, UserCheck } from "lucide-react";
import { IPTypeDisplay } from "./ip-type-display.js";
import { AddressDisplay } from "./address-display.js";

interface AssetAttribute {
  trait_type?: string;
  value?: string;
}

interface AssetOverviewContentProps {
  attributes: AssetAttribute[];
  hasTemplateData: boolean;
  isDisplayAttr: (attribute: AssetAttribute) => boolean;
}

const isAddressLike = (v?: string): boolean => !!v && /^0x[0-9a-fA-F]{16,}$/.test(v.trim());

/**
 * Asset Overview tab — the license receipts. A worldwide-protection banner, the
 * full license bento, then a refined attributes grid (uniform cards, copyable
 * address-like values, no rarity). The human one-line summary lives in the hero
 * column (see AssetLicenseSummary), not here.
 */
export function AssetOverviewContent({
  attributes,
  hasTemplateData,
  isDisplayAttr,
}: AssetOverviewContentProps) {
  const attr = (trait: string) => attributes.find((attribute) => attribute.trait_type === trait)?.value;
  const licenseType = attr("License");
  const commercialUse = attr("Commercial Use");
  const derivatives = attr("Derivatives");
  const attribution = attr("Attribution");
  const territory = attr("Territory");
  const aiPolicy = attr("AI Policy");
  const royalty = attr("Royalty");
  const standard = attr("Standard");
  const registration = attr("Registration");
  const hasLicenseData = licenseType || commercialUse || derivatives || attribution;
  const displayAttributes = attributes.filter((attribute) => isDisplayAttr(attribute));

  const rows = [
    { icon: <ShieldCheck className="h-4 w-4" />, label: "License", value: licenseType },
    { icon: <DollarSign className="h-4 w-4" />, label: "Commercial Use", value: commercialUse },
    { icon: <GitBranch className="h-4 w-4" />, label: "Derivatives", value: derivatives },
    { icon: <UserCheck className="h-4 w-4" />, label: "Attribution", value: attribution },
    { icon: <Globe className="h-4 w-4" />, label: "Territory", value: territory },
    { icon: <Bot className="h-4 w-4" />, label: "AI & Data Mining", value: aiPolicy },
    { icon: <Percent className="h-4 w-4" />, label: "Royalty", value: royalty },
    { icon: <Calendar className="h-4 w-4" />, label: "Registration", value: registration },
  ].filter((row) => !!row.value);

  return (
    <div className="mt-4 space-y-6">
      {hasTemplateData ? <IPTypeDisplay attributes={attributes} /> : null}

      {hasLicenseData ? (
        <div className="space-y-3">
          {standard ? (
            <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3.5">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Your intellectual property is protected worldwide</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Licensing terms are immutably stored on IPFS and recognized under international copyright law.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {rows.map(({ icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3 overflow-hidden transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground/70">
                  {icon}
                  <p className="text-[10px] font-medium uppercase tracking-wider truncate">{label}</p>
                </div>
                <p className="text-sm font-semibold truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Refined attributes — uniform cards, copyable address values, no rarity. */}
      {displayAttributes.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attributes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {displayAttributes.map((attribute, index) => (
              <div
                key={index}
                className="rounded-xl border border-border/50 bg-muted/15 px-3.5 py-3 overflow-hidden transition-colors hover:bg-muted/30"
              >
                <p
                  className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 truncate"
                  title={attribute.trait_type ?? "Trait"}
                >
                  {attribute.trait_type ?? "Trait"}
                </p>
                {isAddressLike(attribute.value) ? (
                  <AddressDisplay address={attribute.value!} chars={4} className="text-sm font-semibold mt-1" />
                ) : (
                  <p className="text-sm font-semibold mt-1 truncate" title={attribute.value ?? "—"}>
                    {attribute.value ?? "—"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!hasTemplateData && !hasLicenseData && displayAttributes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No additional details available.</p>
      ) : null}
    </div>
  );
}
