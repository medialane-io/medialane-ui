"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Archive } from "lucide-react";
import { executeIntent } from "@medialane/sdk/starknet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog.js";
import { Alert, AlertDescription } from "./alert.js";
import { MarketplaceConfirmStep, MarketplaceDialogHero } from "./marketplace-dialog-primitives.js";
import { TransactionDialogStates } from "./transaction-dialog-states.js";
import { useMedialaneApp } from "./medialane-app.js";
import { readArchiveTarget, type ArchiveTarget } from "../utils/archive-asset.js";
import { invalidatePortfolioCache } from "../utils/portfolio-cache.js";
import { successMessages } from "../utils/success-messages.js";
import { isBusyPhase, useTransaction } from "../utils/use-transaction.js";

type Check = { status: "checking" } | { status: "unsupported" } | { status: "ready" | "archived"; target: ArchiveTarget };

export interface ArchiveAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractAddress: string;
  tokenId: string;
  tokenName?: string;
  tokenImage?: string | null;
  hasActiveListing?: boolean;
  onSuccess?: () => void;
}

export function ArchiveAssetDialog({
  open,
  onOpenChange,
  contractAddress,
  tokenId,
  tokenName,
  tokenImage,
  hasActiveListing = false,
  onSuccess,
}: ArchiveAssetDialogProps) {
  const app = useMedialaneApp();
  const tx = useTransaction();
  const [check, setCheck] = useState<Check>({ status: "checking" });
  const busy = isBusyPhase(tx.phase);
  const displayName = tokenName || `Token #${tokenId}`;

  useEffect(() => {
    if (!open) return;
    let alive = true;
    tx.reset();
    setCheck({ status: "checking" });
    void readArchiveTarget(app.getClient().provider, contractAddress, tokenId).then((target) => {
      if (!alive) return;
      setCheck(target ? { status: target.archived ? "archived" : "ready", target } : { status: "unsupported" });
    });
    return () => {
      alive = false;
    };
  }, [open, contractAddress, tokenId]);

  const close = () => {
    tx.reset();
    onOpenChange(false);
  };

  const archive = () => {
    if (check.status !== "ready" || !app.walletAddress) return;
    const { collectionId } = check.target;
    const owner = app.walletAddress;
    void tx.run(async (signer) => {
      const client = app.getClient();
      const intent = await client.createIntent("archive-nft", { owner, collectionId: collectionId.toString(), tokenId });
      await executeIntent(signer, client, intent);
      invalidatePortfolioCache(owner);
    });
  };

  const notice =
    check.status === "archived"
      ? "This asset is already archived."
      : check.status === "unsupported"
        ? "This asset can't be archived."
        : null;

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value && !busy && tx.phase !== "success") close(); }}>
      <DialogContent className="max-w-[calc(100%-6px)] sm:max-w-md p-0 overflow-hidden gap-0 rounded-2xl flex flex-col max-h-[92svh]">
        <DialogTitle className="sr-only">Archive {displayName}</DialogTitle>
        <DialogDescription className="sr-only">Permanently archive this asset onchain.</DialogDescription>

        <TransactionDialogStates
          phase={tx.phase}
          asset={{ name: displayName, image: tokenImage }}
          statusMessage="Confirming on Starknet…"
          txHash={tx.txHash}
          error={tx.error}
          success={successMessages.archived({ name: displayName })}
          successActions={[{ label: "Done", onClick: () => { close(); onSuccess?.(); } }]}
          errorTitle="Archive failed"
          errorDescription="The transaction could not be completed."
          onRetry={tx.retryable ? tx.reset : undefined}
          onDone={close}
        >
          <MarketplaceDialogHero
            tokenImage={tokenImage}
            tokenName={tokenName}
            tokenId={tokenId}
            fallbackIcon={<Archive className="h-12 w-12 text-brand-orange/30" />}
          />
          <div className="px-6 pt-3">
            <p className="font-bold text-lg leading-tight truncate">{displayName}</p>
          </div>
          <MarketplaceConfirmStep
            summary={
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Archiving is permanent and cannot be undone. The asset stays recorded onchain with its owner, creator and history, but it can no longer be transferred or archived again.
                  </AlertDescription>
                </Alert>
                {hasActiveListing ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This asset has an active listing. Cancel the listing first, so the sale can't be left open after archiving.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            }
            description={check.status === "checking" ? "Checking the asset…" : notice ?? "Archive this asset permanently?"}
            error={tx.error}
            secondaryLabel="Cancel"
            onSecondary={close}
            primaryLabel="Archive permanently"
            primaryVariant="destructive"
            primaryDisabled={check.status !== "ready" || !app.walletAddress}
            onPrimary={archive}
          />
        </TransactionDialogStates>
      </DialogContent>
    </Dialog>
  );
}
