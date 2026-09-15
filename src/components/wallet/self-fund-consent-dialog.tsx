"use client";

import { useEffect, useState } from "react";
import { formatAmount } from "@medialane/sdk";
import type { SelfFundConsent, SelfFundFeeEstimate } from "@medialane/sdk/wallet";
import { ActionDialog } from "../action-dialog.js";

interface PendingRequest {
  resolve: (consented: boolean) => void;
  feeEstimate: SelfFundFeeEstimate | null | "loading";
}

export function feeLabelFor(estimate: SelfFundFeeEstimate | null | "loading"): string | null {
  if (estimate === "loading" || estimate == null) return null;
  const [whole, fraction = ""] = formatAmount(estimate.feeRaw.toString(), 18).split(".");
  const trimmed = fraction.slice(0, 6).replace(/0+$/, "");
  const amount = trimmed ? `${whole}.${trimmed}` : whole;
  return `${amount} ${estimate.unit === "FRI" ? "STRK" : "ETH"}`;
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

  return (
    <ActionDialog open={pending !== null} onClose={() => respond(false)} width={420} shadow={false}>
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Pay this transaction</h2>
        <p className="text-sm text-muted-foreground">
          This transaction will cover onchain fees with funds from your account.
        </p>
        <div className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estimated cost</span>
          <span className="text-sm font-semibold">{label ?? "Estimating…"}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => respond(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => respond(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Pay with my wallet
          </button>
        </div>
      </div>
    </ActionDialog>
  );
}
