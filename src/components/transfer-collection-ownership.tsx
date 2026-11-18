"use client";

import { useState } from "react";
import { UserRoundCog } from "lucide-react";
import { normalizeAddress } from "@medialane/sdk";
import { Button } from "./button.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import { MarketplaceConfirmStep } from "./marketplace-dialog-primitives.js";
import { useMedialaneApp } from "./medialane-app.js";
import { TransactionDialog } from "./transaction-dialog.js";
import { TransactionSuccess } from "./transaction-success.js";
import { shortenAddress } from "../utils/address.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { successMessages } from "../utils/success-messages.js";
import { useTransaction } from "../utils/use-transaction.js";
import { useT } from "../i18n/provider.js";

export interface TransferCollectionOwnershipProps {
  collectionId: string;
  currentOwner: string;
  collectionName?: string | null;
  onTransferred?: () => void;
}

export function TransferCollectionOwnership({ collectionId, currentOwner, collectionName, onTransferred }: TransferCollectionOwnershipProps) {
  const t = useT();
  const app = useMedialaneApp();
  const tx = useTransaction();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [newOwner, setNewOwner] = useState("");

  const trimmed = newOwner.trim();
  const isValid = /^0x[0-9a-fA-F]{1,64}$/.test(trimmed);
  const wouldNoop = isValid && normalizeAddress("STARKNET", trimmed) === normalizeAddress("STARKNET", currentOwner);

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };

  const transfer = () => {
    close();
    void tx
      .run(async (signer) => {
        await runIntentCalls(signer, () =>
          app.getClient().createIntent("transfer-collection-ownership", { owner: signer.address, collectionId: String(collectionId), newOwner: trimmed }),
        );
      })
      .then((ok) => {
        if (ok) onTransferred?.();
      });
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => { setNewOwner(""); setOpen(true); }}>
        <UserRoundCog className="h-4 w-4" />
        {t("Transfer ownership")}
      </Button>

      <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
        <DialogContent className="max-w-[calc(100%-6px)] sm:max-w-md p-0 overflow-hidden gap-0 rounded-2xl">
          <DialogTitle className="sr-only">{t("Transfer ownership of")} {collectionName ?? t("collection")}</DialogTitle>
          <DialogDescription className="sr-only">{t("Transfer the on-chain owner of this collection. Existing tokens are unaffected.")}</DialogDescription>

          {confirming ? (
            <MarketplaceConfirmStep
              description={`Transfer ownership to ${shortenAddress(trimmed)}?`}
              secondaryLabel={t("Back")}
              onSecondary={() => setConfirming(false)}
              primaryLabel={t("Transfer ownership")}
              onPrimary={transfer}
              primaryIcon={<UserRoundCog className="h-4 w-4" />}
            />
          ) : (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserRoundCog className="h-5 w-5" />
                <p className="font-bold text-lg">{t("Transfer collection ownership")}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("The new owner will control minting and future ownership transfers for this collection. Existing tokens are unaffected.")}
              </p>
              <div className="space-y-2">
                <Label htmlFor="new-owner">{t("New owner address")}</Label>
                <Input
                  id="new-owner"
                  placeholder="0x…"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="tabular-nums text-sm"
                  spellCheck={false}
                  autoComplete="off"
                />
                {trimmed && !isValid && <p className="text-xs text-red-500">{t("Not a valid Starknet address.")}</p>}
                {wouldNoop && <p className="text-xs text-amber-500">{t("This is already the current owner.")}</p>}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" className="flex-1" onClick={close}>
                  {t("Cancel")}
                </Button>
                <Button className="flex-1" onClick={() => setConfirming(true)} disabled={!isValid || wouldNoop || !app.walletAddress}>
                  {t("Continue")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TransactionDialog tx={tx} title={t("Transfer ownership")} workingLabel="Transferring ownership…" firstStepLabel="Prepare transfer">
        <TransactionSuccess
          name={collectionName ?? "Collection"}
          {...successMessages.ownershipTransferred({ name: collectionName ?? "the collection", to: shortenAddress(trimmed) }, t)}
          txHash={tx.txHash}
          actions={[{ label: t("Done"), onClick: tx.reset }]}
        />
      </TransactionDialog>
    </>
  );
}
