"use client";

import type { ReactNode } from "react";
import { MarketplaceSuccessState } from "./marketplace-dialog-primitives.js";
import { EXPLORER_URL } from "../utils/explorer-url.js";
import type { useTransaction } from "../utils/use-transaction.js";

export interface TransactionDoneProps {
  tx: Pick<ReturnType<typeof useTransaction>, "txHash" | "reset">;
  name: string;
  title: string;
  description: ReactNode;
  footer?: ReactNode;
}

export function TransactionDone({ tx, name, title, description, footer }: TransactionDoneProps) {
  return (
    <MarketplaceSuccessState
      name={name}
      title={title}
      description={description}
      txHash={tx.txHash}
      explorerUrl={EXPLORER_URL}
      footer={footer}
      onDone={tx.reset}
    />
  );
}
