import { ShieldCheck, type LucideIcon } from "lucide-react";

export interface ClaimRailProps {
  /** "What's included" benefits. Omit to hide that panel (e.g. when a live
   *  preview is the rail's first panel instead). */
  included?: { icon: LucideIcon; title: string; desc: string }[];
  /** "How it works" ordered steps. */
  steps: string[];
  /** Trust/assurance note: bold lead + the rest of the sentence. */
  trustLead: string;
  trust: string;
  /** Trust glyph — defaults to a shield. */
  trustIcon?: LucideIcon;
}

/** Right-rail for launchpad/claim pages — one quiet borderless sectioned card
 *  (What's included · How it works · trust). The brand spectrum appears only
 *  as tints: blue benefit chips → purple step numerals → orange trust glyph.
 *  Pure presentation; the consuming app passes the per-surface content. */
export function ClaimRail({ included, steps, trustLead, trust, trustIcon: TrustIcon = ShieldCheck }: ClaimRailProps) {
  return (
    <div className="rounded-2xl bg-card divide-y divide-border/60 overflow-hidden">
      {included && included.length > 0 && (
        <section className="p-5">
          <p className="section-label">What&apos;s included</p>
          <ul className="mt-4 space-y-4">
            {included.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-brand-blue" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="p-5">
        <p className="section-label">How it works</p>
        <ol className="mt-4 space-y-3">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0 text-[13px] font-bold tabular-nums">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/90">{label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="p-5 bg-muted/40 flex items-start gap-3">
        <TrustIcon className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">{trustLead}</span> {trust}
        </p>
      </section>
    </div>
  );
}
