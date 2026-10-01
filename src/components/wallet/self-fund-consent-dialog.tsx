"use client";

import { useEffect, useState } from "react";
import { formatAmount } from "@medialane/sdk";
import type { SelfFundConsent, SelfFundFeeEstimate } from "@medialane/sdk/starknet";
import { ActionDialog } from "../action-dialog.js";

interface PendingRequest {
  resolve: (consented: boolean) => void;
  feeEstimate: SelfFundFeeEstimate | null | "loading";
}

function amountLabel(raw: bigint, unit: string): string {
  const [whole, fraction = ""] = formatAmount(raw.toString(), 18).split(".");
  const trimmed = fraction.slice(0, 6).replace(/0+$/, "");
  const amount = trimmed ? `${whole}.${trimmed}` : whole;
  return `${amount} ${unit === "FRI" ? "STRK" : "ETH"}`;
}

export function feeLabelFor(estimate: SelfFundFeeEstimate | null | "loading"): string | null {
  if (estimate === "loading" || estimate == null) return null;
  return amountLabel(estimate.feeRaw, estimate.unit);
}

export function SelfFundConsentDialog({ consent }: { consent: SelfFundConsent }) {
  const [pending, setPending] = useState<PendingRequest | null>(null);

  useEffect(() => {
    consent.registerHandler((feeEstimatePromise) => {
      return new Promise<boolean>((resolve) => {
        setPending({ resolve, feeEstimate: "loading" });
        void feeEstimatePromise.then((feeEstimate) => {
          setPending((current) => (current ? { ...current, feeEstimate } : current));
        });
      });
    });
    return () => consent.registerHandler(null);
  }, [consent]);

  const respond = (consented: boolean) => {
    pending?.resolve(consented);
    setPending(null);
  };

  const label = feeLabelFor(pending?.feeEstimate ?? null);
  const estimate = pending?.feeEstimate && pending.feeEstimate !== "loading" ? pending.feeEstimate : null;
  const balanceLabel = estimate?.balanceRaw != null ? amountLabel(estimate.balanceRaw, estimate.unit) : null;
  const notEnough = estimate?.balanceRaw != null && estimate.balanceRaw < estimate.feeRaw;

  return (
    <ActionDialog open={pending !== null} onClose={() => respond(false)} width={420} shadow={false}>
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Network fee needed</h2>
        <p className="text-sm text-muted-foreground">
          Medialane usually covers network fees for you, but can&apos;t right now. You can pay this one from your
          wallet, or try again later.
        </p>
        <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network fee</span>
          <span className="text-sm font-semibold">{label ? `≈ ${label}` : "Estimating…"}</span>
        </div>
        {balanceLabel && (
          <div className="flex items-center justify-between px-4">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <span className="text-sm font-semibold">{balanceLabel}</span>
          </div>
        )}
        {notEnough && (
          <p className="text-sm text-destructive">
            You don&apos;t have enough to pay this fee. Try again later, when Medialane can cover it.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => respond(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Try again later
          </button>
          <button
            type="button"
            onClick={() => respond(true)}
            disabled={notEnough}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {label ? `Pay ${label}` : "Pay from my wallet"}
          </button>
        </div>
      </div>
    </ActionDialog>
  );
}
