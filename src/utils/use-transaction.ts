"use client";

import { useCallback, useState } from "react";
import { SponsoredCallRejectedError, assertTransactionSucceeded, syncTransactionBestEffort, type ReceiptLike } from "@medialane/sdk/starknet";
import { useMedialaneApp } from "../components/medialane-app.js";
import type { FastMintSigner } from "../components/fast-mint/types.js";
import { describeError } from "./describe-error.js";

export type TransactionPhase = "idle" | "preparing" | "submitting" | "confirming" | "success" | "error";

export function useTransaction() {
  const app = useMedialaneApp();
  const [phase, setPhase] = useState<TransactionPhase>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptLike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(true);

  const run = useCallback(
    async (work: (signer: FastMintSigner) => Promise<void>): Promise<boolean> => {
      setPhase("preparing");
      setTxHash(null);
      setReceipt(null);
      setError(null);
      setRetryable(true);
      try {
        const signer = await app.getSigner();
        let hash: string | null = null;
        const tracked: FastMintSigner = {
          address: signer.address,
          signTypedData: (data) => signer.signTypedData(data),
          execute: async (calls, opts) => {
            setPhase("submitting");
            const result = await signer.execute(calls, opts);
            hash = result.txHash;
            setTxHash(result.txHash);
            setPhase("confirming");
            return result;
          },
        };
        await work(tracked);
        if (hash) {
          const client = app.getClient();
          setReceipt(await assertTransactionSucceeded(client.provider, hash));
          await syncTransactionBestEffort(client, hash);
        }
        setPhase("success");
        return true;
      } catch (err) {
        if (err instanceof SponsoredCallRejectedError) {
          console.error("[medialane] transaction refused", {
            reference: err.requestId?.slice(0, 8),
            stage: err.stage,
            status: err.status,
            code: err.code,
            detail: err.detail,
          });
        }
        const notice = describeError(err);
        setError(notice.message);
        setRetryable(notice.retryable);
        setPhase("error");
        return false;
      } finally {
        app.releaseSigner?.();
      }
    },
    [app],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setTxHash(null);
    setReceipt(null);
    setError(null);
    setRetryable(true);
  }, []);

  return { phase, txHash, receipt, error, retryable, run, reset };
}
