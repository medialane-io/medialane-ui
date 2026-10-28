"use client";

import { useEffect } from "react";
import { ActionButton } from "../action-button.js";
import { ActionBackdrop, CanvasPortal } from "./action-modal.js";
import { fireConfetti } from "../../utils/media-wallet/confetti.js";
import { explorerTxUrl } from "../../utils/media-wallet/wallet-format.js";
import { useMediaWalletApp } from "./types.js";

const BRAND_GRADIENT = "linear-gradient(115deg, #3b7bff, #8a5cf6, #f6608f, #fb8b46, #3b7bff)";

export function SuccessDialog({
  title,
  message,
  actionLabel = "Done",
  txHash,
  onClose,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  txHash?: string;
  onClose: () => void;
}) {
  const { explorerUrl } = useMediaWalletApp();
  useEffect(() => {
    fireConfetti();
  }, []);
  return (
    <CanvasPortal>
      <div className="absolute inset-0 z-[70] grid place-items-center p-6" onClick={onClose}>
        <ActionBackdrop />
        <div className="card-base relative z-10 w-full max-w-[320px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <div role="status">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{message}</p>
          </div>
          {txHash && (
            <a
              href={explorerTxUrl(explorerUrl, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-brand-blue hover:underline"
            >
              View transaction ↗
            </a>
          )}
          <ActionButton big onClick={onClose} className="mt-5 w-full" style={{ "--ml-grad": BRAND_GRADIENT } as React.CSSProperties}>
            {actionLabel}
          </ActionButton>
        </div>
      </div>
    </CanvasPortal>
  );
}
