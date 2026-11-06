"use client";

import type { ReactNode } from "react";
import { DialogTransactionSuccess, type TransactionSuccessAction } from "./transaction-success.js";
import { MarketplaceErrorState, MarketplaceProcessingState } from "./marketplace-dialog-primitives.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { isBusyPhase, type TransactionPhase } from "../utils/use-transaction.js";
import type { SuccessMessage } from "../utils/success-messages.js";

export interface TransactionDialogStatesProps {
  phase: TransactionPhase;
  asset: { name: string; image?: string | null };
  statusMessage?: string;
  statusDescription?: string;
  txHash: string | null;
  error: string | null;
  success: SuccessMessage;
  successActions?: TransactionSuccessAction[];
  successChildren?: ReactNode;
  errorTitle: string;
  errorDescription: string;
  onRetry?: () => void;
  onDone: () => void;
  children: ReactNode;
}

export function TransactionDialogStates({
  phase,
  asset,
  statusMessage = "Confirming onchain…",
  statusDescription,
  txHash,
  error,
  success,
  successActions,
  successChildren,
  errorTitle,
  errorDescription,
  onRetry,
  onDone,
  children,
}: TransactionDialogStatesProps) {
  const busy = isBusyPhase(phase);

  if (phase === "success" && !error) {
    return (
      <DialogTransactionSuccess
        name={asset.name}
        image={asset.image}
        {...success}
        txHash={txHash}
        actions={successActions ?? [{ label: "Done", onClick: onDone }]}
      >
        {successChildren}
      </DialogTransactionSuccess>
    );
  }

  if (!busy && error && txHash) {
    return (
      <MarketplaceErrorState
        tokenImage={asset.image}
        name={asset.name}
        title={errorTitle}
        description={errorDescription}
        error={error}
        txHash={txHash}
        explorerUrl={EXPLORER_URL}
        onRetry={onRetry}
        onDone={onDone}
      />
    );
  }

  if (busy) {
    return (
      <MarketplaceProcessingState
        title={statusMessage}
        description={statusDescription}
        imageUrl={asset.image}
        imageAlt={asset.name}
        txHash={txHash}
        explorerUrl={EXPLORER_URL}
      />
    );
  }

  return <>{children}</>;
}
