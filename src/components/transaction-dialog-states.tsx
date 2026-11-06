"use client";

import type { ReactNode } from "react";
import { DialogTransactionSuccess } from "./transaction-success.js";
import { MarketplaceErrorState, MarketplaceProcessingState } from "./marketplace-dialog-primitives.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import { isBusyPhase, type TransactionPhase } from "../utils/use-transaction.js";
import type { SuccessMessage } from "../utils/success-messages.js";

export interface TransactionDialogStatesProps {
  phase: TransactionPhase;
  statusMessage?: string;
  txHash: string | null;
  error: string | null;
  success: SuccessMessage;
  successImage?: string | null;
  successName: string;
  errorTitle: string;
  errorDescription: string;
  errorAssetName?: string;
  errorAssetImage?: string | null;
  onRetry?: () => void;
  onDone: () => void;
  children: ReactNode;
}

export function TransactionDialogStates({
  phase,
  statusMessage = "Confirming onchain…",
  txHash,
  error,
  success,
  successImage = null,
  successName,
  errorTitle,
  errorDescription,
  errorAssetName,
  errorAssetImage = null,
  onRetry,
  onDone,
  children,
}: TransactionDialogStatesProps) {
  const busy = isBusyPhase(phase);

  if (phase === "success" && !error) {
    return (
      <DialogTransactionSuccess
        name={successName}
        image={successImage}
        {...success}
        txHash={txHash}
        actions={[{ label: "Done", onClick: onDone }]}
      />
    );
  }

  if (!busy && error && txHash) {
    return (
      <MarketplaceErrorState
        tokenImage={errorAssetImage}
        name={errorAssetName ?? "Asset"}
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
    return <MarketplaceProcessingState title={statusMessage} txHash={txHash} explorerUrl={EXPLORER_URL} />;
  }

  return <>{children}</>;
}
