"use client";

import type { ReactNode } from "react";
import { Check, CircleAlert, ExternalLink, Percent, X } from "lucide-react";
import { IPTypeDisplay } from "./ip-type-display.js";
import { AddressDisplay } from "./address-display.js";
import { MarkdownText } from "./markdown-text.js";
import { licenseSummary } from "../utils/license-summary.js";
import { LICENSE_TYPES } from "../data/ip.js";

interface AssetAttribute {
  trait_type?: string;
  value?: string;
}

interface AssetOverviewContentProps {
  attributes: AssetAttribute[];
  hasTemplateData: boolean;
  isDisplayAttr: (attribute: AssetAttribute) => boolean;
  content?: string | null;
  link?: string | null;
}

function licenseLabel(value: string): string {
  const label = LICENSE_TYPES.find((license) => license.value === value)?.label ?? value;
  return label.split(" — ")[1] ?? label;
}

function statusIcon(value: string): ReactNode {
  const v = value.trim().toLowerCase();
  if (["yes", "allowed", "worldwide", "not required"].includes(v)) return <Check className="h-4 w-4 text-emerald-500" />;
  if (["no", "not allowed"].includes(v)) return <X className="h-4 w-4 text-destructive" />;
  return <CircleAlert className="h-4 w-4 text-amber-500" />;
}

const isAddressLike = (v?: unknown): boolean =>
  typeof v === "string" && /^0x[0-9a-fA-F]{16,}$/.test(v.trim());

function Cell({
  icon,
  label,
  value,
  wide,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between gap-2 rounded-xl bg-muted/25 ring-1 ring-border/40 p-3.5 ${
        wide ? "col-span-2" : ""
      }`}
    >
      {icon ? <span className="text-primary/70">{icon}</span> : null}
      <div className="space-y-0.5">
        <p className="text-2xs font-medium text-muted-foreground truncate" title={label}>
          {label}
        </p>
        <div className="text-sm font-bold text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

export function AssetOverviewContent({
  attributes,
  hasTemplateData,
  isDisplayAttr,
  content,
  link,
}: AssetOverviewContentProps) {
  const attr = (trait: string) => attributes.find((attribute) => attribute.trait_type === trait)?.value;
  const licenseType = attr("License");
  const commercialUse = attr("Commercial Use");
  const derivatives = attr("Derivatives");
  const attribution = attr("Attribution");
  const territory = attr("Territory");
  const aiPolicy = attr("AI Policy");
  const royalty = attr("Royalty");
  const summary = licenseSummary(attributes);
  const hasLicenseData = !!(licenseType || commercialUse || derivatives || attribution);
  const displayAttributes = attributes.filter((attribute) => isDisplayAttr(attribute));

  const licenseDescription = LICENSE_TYPES.find((license) => license.value === licenseType)?.description;

  const facts = [
    { label: "Commercial use", value: commercialUse },
    { label: "Derivatives", value: derivatives },
    { label: "Attribution", value: attribution },
    { label: "Territory", value: territory },
    { label: "AI & data mining", value: aiPolicy },
    { label: "Royalty", value: royalty, icon: <Percent className="h-4 w-4" /> },
  ].filter((row) => !!row.value);

  return (
    <div className="mt-4 space-y-7">
      {content ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Content</h3>
          <MarkdownText text={content} />
        </section>
      ) : null}

      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5" />
          Open link
        </a>
      ) : null}

      {hasTemplateData ? <IPTypeDisplay attributes={attributes} /> : null}

      {hasLicenseData ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Rights</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="col-span-full flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 ring-1 ring-primary/15 p-5">
              {licenseType ? (
                <p className="text-xl sm:text-2xl font-bold leading-tight text-foreground">{licenseLabel(licenseType)}</p>
              ) : null}
              {licenseDescription ? (
                <p className="text-sm text-muted-foreground">{licenseDescription}</p>
              ) : null}
              {summary ? (
                <p className="text-base sm:text-lg font-semibold leading-snug text-foreground">{summary}</p>
              ) : null}
            </div>

            {facts.map(({ icon, label, value }) => (
              <Cell key={label} icon={icon ?? statusIcon(String(value))} label={label} value={value} />
            ))}

            <div className="col-span-full rounded-xl bg-muted/25 ring-1 ring-border/40 p-3.5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Creative work is protected with international copyright law. The Berne Convention for the Protection of Literary and Artistic Works is the foundational international copyright treaty, ratified by 181 signatory countries.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {displayAttributes.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 [grid-auto-flow:dense] auto-rows-[minmax(6rem,auto)]">
            {displayAttributes.map((attribute, index) => (
              <Cell
                key={index}
                label={attribute.trait_type ?? "Trait"}
                wide={isAddressLike(attribute.value)}
                value={
                  isAddressLike(attribute.value) ? (
                    <AddressDisplay address={attribute.value!} chars={4} className="text-sm font-bold" />
                  ) : (
                    attribute.value ?? "—"
                  )
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {!hasTemplateData && !hasLicenseData && displayAttributes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No additional details available.</p>
      ) : null}
    </div>
  );
}
