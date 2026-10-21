"use client";

import { licenseSummary } from "../utils/license-summary.js";

interface Attr {
  trait_type?: string;
  value?: string;
}

const FACTS = [
  ["Commercial use", "Commercial Use"],
  ["Derivatives", "Derivatives"],
  ["Attribution", "Attribution"],
  ["AI & data mining", "AI Policy"],
  ["Territory", "Territory"],
] as const;

export function AssetRightsCard({ attributes }: { attributes: Attr[] }) {
  const attr = (trait: string) => attributes.find((a) => a.trait_type === trait)?.value;
  const license = attr("License");
  const summary = licenseSummary(attributes);
  const facts = FACTS.map(([label, trait]) => ({ label, value: attr(trait) })).filter((f) => !!f.value);
  if (!license && !summary && facts.length === 0) return null;
  return (
    <section className="space-y-3 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-4 ring-1 ring-primary/15">
      {license ? <span className="pill-badge text-2xs">{license}</span> : null}
      {summary ? <p className="text-sm font-semibold leading-snug">{summary}</p> : null}
      {facts.length > 0 ? (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 border-t border-border/40 pt-3 text-xs">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-muted-foreground">{f.label}</dt>
              <dd className="font-semibold truncate">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
