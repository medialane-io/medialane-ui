"use client";

import { ScrollText } from "lucide-react";
import { cn } from "../utils/cn.js";
import { CurrencyIcon } from "./currency-icon.js";
import { LICENSE_TYPES, GEOGRAPHIC_SCOPES, AI_POLICIES } from "../data/ip.js";

/** Common sponsorship media/channel types — deliberately not part of the
 *  general IP taxonomy in `data/ip.ts` (that's about the asset itself;
 *  this is about the sponsorship deal's channels), so it stays local here. */
export const MEDIA_TYPES = [
  "Social Media", "Video", "Photo", "Article/Blog", "Print", "Broadcast", "Podcast/Audio", "Livestream",
] as const;

/**
 * The deal terms a sponsorship offer/proposal needs, in plain-language shape
 * — no bps, no IPFS, no ByteArray. `royaltyPercent` is a plain 0–100 number
 * (multiply by 100 for the contract's basis-points argument). Every field
 * here is declarative metadata carried in the pinned IPFS document (see
 * `toLicenseMetadata`) — the contract never reads any of it, so none of it
 * is enforced beyond the atomic accept-and-mint payment itself. This
 * component only collects and validates the data, it never fetches or
 * uploads anything itself.
 */
export interface SponsorshipTerms {
  amount: string;
  paymentTokenSymbol: string;
  /** No default — the user must explicitly set this, never silently inherit one. */
  durationDays: string;
  transferable: boolean;
  /** Not surfaced in the UI (no resale-royalty concept here) — always "0". Kept
   *  on the type because `create_offer`/`propose_sponsorship` still take a
   *  `royaltyBps` argument. */
  royaltyPercent: string;
  /** Free-text notes that don't fit any structured field below. */
  licenseText: string;
  licenseType: string;
  commercialUse: "Yes" | "No";
  derivatives: "Allowed" | "Not Allowed" | "Share-Alike";
  attribution: "Required" | "Not Required";
  territory: string;
  aiPolicy: string;
  /** e.g. "Instagram + YouTube only" — too deal-specific to bound into an enum. */
  scope: string;
  /** e.g. "3 posts, 1 video" */
  deliverables: string;
  exclusive: boolean;
  approvalRequired: boolean;
  media: string[];
  mediaOther: string;
}

export const EMPTY_SPONSORSHIP_TERMS: SponsorshipTerms = {
  amount: "",
  paymentTokenSymbol: "",
  durationDays: "",
  transferable: true,
  royaltyPercent: "0",
  licenseText: "",
  licenseType: "CC BY-SA",
  commercialUse: "Yes",
  derivatives: "Share-Alike",
  attribution: "Required",
  territory: "Worldwide",
  aiPolicy: "Allowed",
  scope: "",
  deliverables: "",
  exclusive: false,
  approvalRequired: false,
  media: [],
  mediaOther: "",
};

/** Shapes the pinned-IPFS-JSON payload — the single place both apps build
 *  this object, so it can't drift across call sites. Purely additive; the
 *  contract never reads any of it. */
export function toLicenseMetadata(terms: SponsorshipTerms): Record<string, unknown> {
  return {
    terms: terms.licenseText,
    transferable: terms.transferable,
    royaltyPercent: Number(terms.royaltyPercent || "0"),
    licenseType: terms.licenseType,
    commercialUse: terms.commercialUse,
    derivatives: terms.derivatives,
    attribution: terms.attribution,
    territory: terms.territory,
    aiPolicy: terms.aiPolicy,
    scope: terms.scope,
    deliverables: terms.deliverables,
    exclusive: terms.exclusive,
    approvalRequired: terms.approvalRequired,
    media: terms.media,
    mediaOther: terms.mediaOther,
  };
}

export interface LicenseTermsBuilderProps {
  value: SponsorshipTerms;
  onChange: (next: SponsorshipTerms) => void;
  /** Payment token symbols to offer — e.g. from SUPPORTED_TOKENS. */
  tokenOptions: string[];
  /** Copy override for the amount field — "Minimum bid" for an owner's
   *  offer, "Amount you'll pay" for a sponsor's proposal. Default: "Amount". */
  amountLabel?: string;
  disabled?: boolean;
  className?: string;
}

const FIELD_LABEL = "text-xs font-semibold text-foreground";
const FIELD_HELP = "text-xs text-muted-foreground";
const INPUT_BASE =
  "w-full h-10 rounded-xl border border-border bg-card px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple/40 disabled:opacity-50";

function ToggleGroup({ value, options, onChange, disabled }: { value: string; options: readonly string[]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden w-full">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 px-3 py-2 text-xs sm:text-sm transition-colors disabled:opacity-50",
            i > 0 && "border-l border-border",
            value === opt
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-background hover:bg-muted text-muted-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function YesNoToggle({ label, help, checked, onChange, disabled }: { label: string; help: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className={FIELD_LABEL}>{label}</label>
      <ToggleGroup value={checked ? "Yes" : "No"} options={["Yes", "No"]} onChange={(v) => onChange(v === "Yes")} disabled={disabled} />
      <p className={FIELD_HELP}>{help}</p>
    </div>
  );
}

export function LicenseTermsBuilder({
  value, onChange, tokenOptions, amountLabel = "Amount", disabled, className,
}: LicenseTermsBuilderProps) {
  const set = <K extends keyof SponsorshipTerms>(key: K, v: SponsorshipTerms[K]) =>
    onChange({ ...value, [key]: v });

  const handleLicenseTypeChange = (licenseType: string) => {
    const def = LICENSE_TYPES.find((l) => l.value === licenseType);
    onChange({
      ...value,
      licenseType,
      ...(def ? { commercialUse: def.commercialUse, derivatives: def.derivatives, attribution: def.attribution } : {}),
    });
  };

  const selectedLicense = LICENSE_TYPES.find((l) => l.value === value.licenseType);
  const toggleMedia = (m: string) => {
    const next = value.media.includes(m) ? value.media.filter((x) => x !== m) : [...value.media, m];
    set("media", next);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>{amountLabel}</label>
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          disabled={disabled}
          value={value.amount}
          onChange={(e) => set("amount", e.target.value)}
          placeholder="0.00"
          className={INPUT_BASE}
        />
      </div>

      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>Currency</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {tokenOptions.map((symbol) => (
            <button
              key={symbol}
              type="button"
              disabled={disabled}
              onClick={() => set("paymentTokenSymbol", symbol)}
              aria-pressed={value.paymentTokenSymbol === symbol}
              className={cn(
                "h-10 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50",
                value.paymentTokenSymbol === symbol
                  ? "border-brand-purple bg-brand-purple/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <CurrencyIcon symbol={symbol} size={14} />
              {symbol}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          disabled={disabled}
          checked={value.transferable}
          onChange={(e) => set("transferable", e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-brand-purple focus:ring-brand-purple/40"
        />
        <span className="text-sm">
          <span className="font-medium">Sponsor can resell this license</span>
          <span className={cn(FIELD_HELP, "block")}>Off means it&apos;s meant to stay with the sponsor who accepts it — resale still isn&apos;t blocked on-chain, this is just the stated intent.</span>
        </span>
      </label>

      <div className="rounded-xl border border-border overflow-hidden bg-card/40">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <ScrollText className="h-4 w-4 text-brand-purple shrink-0" />
          <span className="text-sm font-semibold">How long, where, and what for</span>
        </div>

        <div className="px-4 pb-4 space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>License length (days)</label>
              <input
                type="number"
                min={1}
                disabled={disabled}
                value={value.durationDays}
                onChange={(e) => set("durationDays", e.target.value)}
                placeholder="e.g. 30"
                className={INPUT_BASE}
              />
              <p className={FIELD_HELP}>Counted from the moment the deal is accepted, not from today.</p>
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>License type</label>
              <select
                disabled={disabled}
                value={value.licenseType}
                onChange={(e) => handleLicenseTypeChange(e.target.value)}
                className={INPUT_BASE}
              >
                {LICENSE_TYPES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              {selectedLicense ? <p className={FIELD_HELP}>{selectedLicense.description}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Commercial use</label>
              <ToggleGroup value={value.commercialUse} options={["Yes", "No"]} onChange={(v) => set("commercialUse", v as SponsorshipTerms["commercialUse"])} disabled={disabled} />
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Derivatives</label>
              <ToggleGroup value={value.derivatives} options={["Allowed", "Not Allowed", "Share-Alike"]} onChange={(v) => set("derivatives", v as SponsorshipTerms["derivatives"])} disabled={disabled} />
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Attribution</label>
              <ToggleGroup value={value.attribution} options={["Required", "Not Required"]} onChange={(v) => set("attribution", v as SponsorshipTerms["attribution"])} disabled={disabled} />
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Territory</label>
              <select
                disabled={disabled}
                value={value.territory}
                onChange={(e) => set("territory", e.target.value)}
                className={INPUT_BASE}
              >
                {GEOGRAPHIC_SCOPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>AI policy</label>
              <select
                disabled={disabled}
                value={value.aiPolicy}
                onChange={(e) => set("aiPolicy", e.target.value)}
                className={INPUT_BASE}
              >
                {AI_POLICIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <p className={FIELD_HELP}>Whether this work can be used to train AI models.</p>
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Scope <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input
                type="text"
                disabled={disabled}
                value={value.scope}
                onChange={(e) => set("scope", e.target.value)}
                placeholder="e.g. Instagram + YouTube only"
                className={INPUT_BASE}
              />
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Deliverables <span className="font-normal text-muted-foreground">(optional)</span></label>
              <textarea
                disabled={disabled}
                value={value.deliverables}
                onChange={(e) => set("deliverables", e.target.value)}
                placeholder="e.g. 3 posts, 1 video"
                rows={2}
                className={cn(INPUT_BASE, "h-auto py-2.5 resize-y")}
              />
            </div>

            <YesNoToggle
              label="Exclusive to this sponsor"
              help="No other sponsors during the license term."
              checked={value.exclusive}
              onChange={(v) => set("exclusive", v)}
              disabled={disabled}
            />

            <YesNoToggle
              label="Content approval required"
              help="Sponsor reviews content before it's published."
              checked={value.approvalRequired}
              onChange={(v) => set("approvalRequired", v)}
              disabled={disabled}
            />

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Media <span className="font-normal text-muted-foreground">(optional)</span></label>
              <div className="flex flex-wrap gap-1.5">
                {MEDIA_TYPES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleMedia(m)}
                    className={cn(
                      "h-8 px-2.5 rounded-full border text-xs font-medium transition-colors disabled:opacity-50",
                      value.media.includes(m)
                        ? "border-brand-purple bg-brand-purple/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <input
                type="text"
                disabled={disabled}
                value={value.mediaOther}
                onChange={(e) => set("mediaOther", e.target.value)}
                placeholder="Other media type"
                className={cn(INPUT_BASE, "mt-1.5")}
              />
            </div>

            <div className="space-y-1.5">
              <label className={FIELD_LABEL}>Additional terms <span className="font-normal text-muted-foreground">(optional)</span></label>
              <textarea
                disabled={disabled}
                value={value.licenseText}
                onChange={(e) => set("licenseText", e.target.value)}
                placeholder="Anything else worth spelling out."
                rows={3}
                className={cn(INPUT_BASE, "h-auto py-2.5 resize-y")}
              />
              <p className={FIELD_HELP}>Saved permanently and shown to anyone who holds the license.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
