"use client";

import { cn } from "../utils/cn.js";

/**
 * The deal terms a sponsorship offer/proposal needs, in plain-language shape
 * — no bps, no IPFS, no ByteArray. `royaltyPercent` is a plain 0–100 number
 * (multiply by 100 for the contract's basis-points argument); `licenseText`
 * is the terms document's raw content — the caller pins it to IPFS (via
 * their own existing upload helper) and passes the resulting `ipfs://` URI
 * to the SDK call. This component only collects and validates the data, it
 * never fetches or uploads anything itself.
 */
export interface SponsorshipTerms {
  amount: string;
  paymentTokenSymbol: string;
  durationDays: string;
  transferable: boolean;
  royaltyPercent: string;
  licenseText: string;
}

export const EMPTY_SPONSORSHIP_TERMS: SponsorshipTerms = {
  amount: "",
  paymentTokenSymbol: "",
  durationDays: "30",
  transferable: true,
  royaltyPercent: "5",
  licenseText: "",
};

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

export function LicenseTermsBuilder({
  value, onChange, tokenOptions, amountLabel = "Amount", disabled, className,
}: LicenseTermsBuilderProps) {
  const set = <K extends keyof SponsorshipTerms>(key: K, v: SponsorshipTerms[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-[1fr_auto] gap-2">
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
          <select
            disabled={disabled}
            value={value.paymentTokenSymbol}
            onChange={(e) => set("paymentTokenSymbol", e.target.value)}
            className={cn(INPUT_BASE, "w-24")}
          >
            <option value="" disabled>—</option>
            {tokenOptions.map((symbol) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>License length (days)</label>
        <input
          type="number"
          min={1}
          disabled={disabled}
          value={value.durationDays}
          onChange={(e) => set("durationDays", e.target.value)}
          className={INPUT_BASE}
        />
        <p className={FIELD_HELP}>Counted from the moment the deal is accepted, not from today.</p>
      </div>

      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>Resale royalty (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          step="0.1"
          disabled={disabled}
          value={value.royaltyPercent}
          onChange={(e) => set("royaltyPercent", e.target.value)}
          className={INPUT_BASE}
        />
        <p className={FIELD_HELP}>You get this share automatically if the license is ever resold.</p>
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

      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>License terms</label>
        <textarea
          disabled={disabled}
          value={value.licenseText}
          onChange={(e) => set("licenseText", e.target.value)}
          placeholder="What can the sponsor do with this license? Usage rights, credit requirements, territory, anything else worth spelling out."
          rows={4}
          className={cn(INPUT_BASE, "h-auto py-2.5 resize-y")}
        />
        <p className={FIELD_HELP}>Saved permanently and shown to anyone who holds the license.</p>
      </div>
    </div>
  );
}
