"use client";

import type { ReactNode } from "react";
import { Bot, DollarSign, ExternalLink, GitBranch, Globe, Percent, Scale, UserCheck } from "lucide-react";
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

const isAddressLike = (v?: unknown): boolean =>
  typeof v === "string" && /^0x[0-9a-fA-F]{16,}$/.test(v.trim());

function fillSpans(units: number[], cols: number): number[] {
  const out = units.map((unit) => Math.min(unit, cols));
  const rest = out.reduce((sum, unit) => sum + unit, 0) % cols;
  if (rest && out.length) out[out.length - 1] += cols - rest;
  return out;
}

function bentoSpans(count: number): number[] {
  const out: number[] = [];
  const rows = [[2, 1], [1, 2]];
  for (let row = 0; out.length < count; row++) {
    const left = count - out.length;
    if (left === 1) out.push(3);
    else out.push(...rows[row % 2]);
  }
  return out;
}

const SPAN_2: Record<number, string> = { 1: "col-span-1", 2: "col-span-2" };
const SPAN_SM_4: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
};
const SPAN_LG_3: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
};

const DETAIL_TINTS = [
  "bg-brand-blue/10 [&_p]:text-brand-blue",
  "bg-brand-rose/10 [&_p]:text-brand-rose",
  "bg-brand-purple/10 [&_p]:text-brand-purple",
  "bg-brand-orange/10 [&_p]:text-brand-orange",
];

function Cell({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col justify-end gap-1 rounded-3xl px-5 py-4 min-h-[5.5rem] ${className ?? ""}`}
    >
      <p className="text-xs font-medium truncate" title={label}>
        {label}
      </p>
      <div className="text-lg font-semibold leading-tight tracking-tight text-foreground break-words">{value}</div>
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
    { icon: DollarSign, label: "Commercial use", value: commercialUse, tile: "bg-brand-orange text-white", pill: "bg-white/20" },
    { icon: GitBranch, label: "Derivatives", value: derivatives, tile: "bg-brand-rose text-white", pill: "bg-white/20" },
    { icon: UserCheck, label: "Attribution", value: attribution, tile: "bg-foreground text-background", pill: "bg-background/15" },
    { icon: Globe, label: "Territory", value: territory, tile: "bg-brand-blue text-white", pill: "bg-white/20" },
    { icon: Bot, label: "AI & data mining", value: aiPolicy, tile: "bg-brand-purple text-white", pill: "bg-white/20" },
    { icon: Percent, label: "Royalty", value: royalty, tile: "bg-brand-orange text-white", pill: "bg-white/20" },
  ].filter((row) => !!row.value);

  const factSpans2 = fillSpans(facts.map(() => 1), 2);
  const factSpansLg = bentoSpans(facts.length);
  const detailUnits = displayAttributes.map((attribute) => (isAddressLike(attribute.value) ? 2 : 1));
  const detailSpans2 = fillSpans(detailUnits, 2);
  const detailSpansSm = fillSpans(detailUnits, 4);

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
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative col-span-2 lg:col-span-3 flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-purple via-brand-blue to-brand-blue p-6 text-white sm:p-8">
              <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full ring-[28px] ring-white/10" />
              <span aria-hidden className="pointer-events-none absolute right-10 top-12 h-20 w-20 rounded-full bg-brand-rose/70" />
              <div className="relative space-y-3">
                {licenseType ? (
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">
                    {licenseLabel(licenseType)}
                  </p>
                ) : null}
                {licenseDescription ? (
                  <p className="max-w-md text-sm text-white/80">{licenseDescription}</p>
                ) : null}
                {summary ? (
                  <p className="inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium leading-snug backdrop-blur-sm">
                    {summary}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(8.5rem,1fr)]">
              {facts.map(({ icon: Icon, label, value, tile, pill }, index) => (
                <div
                  key={label}
                  className={`relative flex flex-col justify-between gap-4 overflow-hidden rounded-[1.75rem] p-5 ${tile} ${SPAN_2[factSpans2[index]]} ${SPAN_LG_3[factSpansLg[index]]}`}
                >
                  <Icon aria-hidden className="pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 opacity-15" />
                  <span className={`relative inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${pill}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  <p className="relative text-2xl sm:text-3xl font-semibold leading-none tracking-tight break-words">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative col-span-2 lg:col-span-6 flex items-center gap-4 overflow-hidden rounded-[2rem] bg-brand-rose/10 p-5 sm:p-6">
              <Scale aria-hidden className="pointer-events-none absolute -right-4 -bottom-8 h-32 w-32 -rotate-12 text-brand-rose/15" />
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-rose text-white">
                <Scale className="h-5 w-5" />
              </span>
              <p className="relative max-w-3xl text-sm leading-relaxed text-foreground/80">
                Creative work is protected with international copyright law. The Berne Convention for the Protection of Literary and Artistic Works is the foundational international copyright treaty, ratified by 181 signatory countries.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {displayAttributes.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 [grid-auto-flow:dense]">
            {displayAttributes.map((attribute, index) => (
              <Cell
                key={index}
                label={attribute.trait_type ?? "Trait"}
                className={`${DETAIL_TINTS[index % DETAIL_TINTS.length]} ${SPAN_2[detailSpans2[index]]} ${SPAN_SM_4[detailSpansSm[index]]}`}
                value={
                  isAddressLike(attribute.value) ? (
                    <AddressDisplay address={attribute.value!} chars={4} className="text-base font-semibold" />
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
