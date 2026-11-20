"use client";

import type { ReactNode } from "react";
import { Bot, DollarSign, ExternalLink, GitBranch, Globe, Percent, Scale, UserCheck } from "lucide-react";
import { IPTypeDisplay } from "./ip-type-display.js";
import { AddressDisplay } from "./address-display.js";
import { MarkdownText } from "./markdown-text.js";
import { licenseSummary } from "../utils/license-summary.js";
import { LICENSE_TYPES } from "../data/ip.js";
import { useT } from "../i18n/provider.js";

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

function detailSpans(count: number): number[] {
  const out: number[] = [];
  while (out.length < count) {
    const left = count - out.length;
    if (left >= 5) out.push(1, 2, 1);
    else if (left === 4 || left === 2) out.push(...Array(left).fill(2));
    else if (left === 3) out.push(1, 2, 1);
    else out.push(4);
  }
  return out.slice(0, count);
}

function Cell({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col justify-end gap-1.5 rounded-3xl bg-foreground/[0.06] ring-1 ring-border/40 px-5 py-4 min-h-[5.5rem] ${className ?? ""}`}
    >
      <p className="truncate text-xs font-medium text-muted-foreground" title={label}>{label}</p>
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
  const t = useT();
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
    { icon: DollarSign, label: t("Commercial use"), value: commercialUse, tile: "bg-brand-orange/10 ring-brand-orange/20", pill: "bg-brand-orange/15 text-brand-orange" },
    { icon: GitBranch, label: t("Derivatives"), value: derivatives, tile: "bg-brand-rose/10 ring-brand-rose/20", pill: "bg-brand-rose/15 text-brand-rose" },
    { icon: UserCheck, label: t("Attribution"), value: attribution, tile: "bg-foreground/5 ring-border/60", pill: "bg-foreground/10 text-muted-foreground" },
    { icon: Globe, label: t("Territory"), value: territory, tile: "bg-brand-blue/10 ring-brand-blue/20", pill: "bg-brand-blue/15 text-brand-blue" },
    { icon: Bot, label: t("AI & data mining"), value: aiPolicy, tile: "bg-brand-purple/10 ring-brand-purple/20", pill: "bg-brand-purple/15 text-brand-purple" },
    { icon: Percent, label: t("Royalty"), value: royalty, tile: "bg-brand-orange/10 ring-brand-orange/20", pill: "bg-brand-orange/15 text-brand-orange" },
  ].filter((row) => !!row.value);

  const factSpans2 = fillSpans(facts.map(() => 1), 2);
  const factSpansLg = bentoSpans(facts.length);
  const detailUnits = displayAttributes.map((attribute) => (isAddressLike(attribute.value) ? 2 : 1));
  const detailSpans2 = fillSpans(detailUnits, 2);
  const detailSpansSm = detailSpans(displayAttributes.length).map((span, index) => Math.max(span, detailUnits[index]));

  return (
    <div className="mt-4 space-y-7">
      {content ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("Content")}</h3>
          <MarkdownText text={content} />
        </section>
      ) : null}

      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5" />
          {t("Open link")}
        </a>
      ) : null}

      {hasTemplateData ? <IPTypeDisplay attributes={attributes} /> : null}

      {hasLicenseData ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("Rights")}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative col-span-2 lg:col-span-3 flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-purple/15 via-brand-blue/10 to-transparent p-6 text-foreground ring-1 ring-brand-blue/20 backdrop-blur-sm sm:p-8">
              <div className="relative space-y-3">
                {licenseType ? (
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.05]">
                    {licenseLabel(licenseType)}
                  </p>
                ) : null}
                {licenseDescription ? (
                  <p className="max-w-md text-sm text-muted-foreground">{licenseDescription}</p>
                ) : null}
                {summary ? (
                  <p className="inline-block rounded-full bg-foreground/5 px-4 py-2 text-sm font-medium leading-snug text-muted-foreground ring-1 ring-border/60">
                    {summary}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[minmax(8.5rem,1fr)]">
              {facts.map(({ icon: Icon, label, value, tile, pill }, index) => (
                <div
                  key={label}
                  className={`relative flex flex-col justify-between gap-4 overflow-hidden rounded-[1.75rem] p-5 text-foreground ring-1 backdrop-blur-sm ${tile} ${SPAN_2[factSpans2[index]]} ${SPAN_LG_3[factSpansLg[index]]}`}
                >
                  <span className={`relative inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${pill}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  <p className="relative text-xl sm:text-2xl font-semibold leading-none tracking-tight break-words">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative col-span-2 lg:col-span-6 flex items-center gap-4 overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-rose/10 to-brand-orange/10 p-5 ring-1 ring-brand-rose/20 backdrop-blur-sm sm:p-6">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-rose/15 text-brand-rose">
                <Scale className="h-5 w-5" />
              </span>
              <p className="relative text-sm leading-relaxed text-muted-foreground">
                {t("Creative work is protected with international copyright law. The Berne Convention for the Protection of Literary and Artistic Works is the foundational international copyright treaty, ratified by 181 signatory countries.")}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {displayAttributes.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{t("Details")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 [grid-auto-flow:dense]">
            {displayAttributes.map((attribute, index) => (
              <Cell
                key={index}
                label={attribute.trait_type ?? t("Trait")}
                className={`${SPAN_2[detailSpans2[index]]} ${SPAN_SM_4[detailSpansSm[index]]}`}
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
        <p className="text-sm text-muted-foreground">{t("No additional details available.")}</p>
      ) : null}
    </div>
  );
}
