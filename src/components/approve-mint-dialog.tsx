"use client";

import { useEffect, useState } from "react";
import { AlertCircle, GitBranch, Loader2 } from "lucide-react";
import type { ApiCollection, ApiRemixOffer } from "@medialane/sdk";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { Alert, AlertDescription } from "./alert.js";
import { TransactionDialogStates } from "./transaction-dialog-states.js";
import { isBusyPhase, type TransactionPhase } from "../utils/use-transaction.js";
import { formatDisplayPrice } from "../utils/format.js";
import { successMessages } from "../utils/success-messages.js";

export interface ApproveMintDialogProps {
  offer: ApiRemixOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: ApiCollection[];
  footerNote: string;
  newAssetHref?: string | null;
  tx: {
    phase: TransactionPhase;
    txHash: string | null;
    error: string | null;
    retryable?: boolean;
    reset: () => void;
  };
  onApprove: (collection: ApiCollection, name: string) => void;
}

const keyOf = (c: ApiCollection) => c.collectionId ?? c.contractAddress;

export function ApproveMintDialog({ offer, open, onOpenChange, collections, footerNote, newAssetHref, tx, onApprove }: ApproveMintDialogProps) {
  const { phase, txHash, error, retryable = true, reset } = tx;
  const busy = isBusyPhase(phase);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [remixName, setRemixName] = useState("");

  const defaultCollection = collections.find((c) => c.contractAddress === offer?.originalContract) ?? collections[0];
  const effectiveKey = selectedKey ?? (defaultCollection ? keyOf(defaultCollection) : null);
  const selected = collections.find((c) => keyOf(c) === effectiveKey);
  const effectiveName = remixName.trim() || `Remix of Token #${offer?.originalTokenId}`;
  const priceDisplay = offer?.price ? `${formatDisplayPrice(offer.price.formatted)} ${offer.price.currency}` : "—";

  const clear = () => {
    setSelectedKey(null);
    setRemixName("");
    reset();
  };

  useEffect(() => {
    if (open) clear();
  }, [open]);

  const close = () => {
    clear();
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value && !busy) close();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-sm p-0 overflow-hidden gap-0 flex flex-col max-h-[90svh]">
        <div className="flex items-center gap-2 pr-10 pl-5 py-4 border-b border-border/60">
          <GitBranch className="h-4 w-4 text-primary shrink-0" />
          <DialogTitle className="text-base font-bold">Grant license &amp; mint</DialogTitle>
        </div>
        <DialogDescription className="sr-only">Mint the derivative into one of your collections and list it for the requester.</DialogDescription>

        <TransactionDialogStates
          phase={phase}
          asset={{ name: effectiveName }}
          statusMessage="Minting and listing…"
          txHash={txHash}
          error={error}
          success={successMessages.licenseGranted({ price: priceDisplay })}
          successActions={[
            { label: "Done", onClick: close },
            ...(newAssetHref ? [{ label: "View new asset", href: newAssetHref }] : []),
          ]}
          errorTitle="Minting failed"
          errorDescription="The transaction was submitted, but the remix could not be completed."
          onRetry={retryable ? reset : undefined}
          onDone={close}
        >
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {offer && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">License</span> {offer.licenseType}</p>
                <p><span className="text-muted-foreground">Price</span> {priceDisplay}</p>
                {offer.message && <p className="text-muted-foreground italic">&quot;{offer.message}&quot;</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="remix-name">Remix Name</Label>
              <Input id="remix-name" placeholder={effectiveName} value={remixName} onChange={(e) => setRemixName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Mint into collection</Label>
              {collections.length === 0 ? (
                <p className="text-xs text-destructive">No eligible collections.</p>
              ) : (
                <Select value={effectiveKey ?? ""} onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((c) => (
                      <SelectItem key={keyOf(c)} value={keyOf(c)}>
                        <span className="flex items-center gap-2">
                          {c.name ?? `${c.contractAddress.slice(0, 14)}…`}
                          {c.standard && <span className="text-2xs tabular-nums text-muted-foreground">{c.standard}</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="px-5 pt-3 pb-5 border-t border-border/60 space-y-3">
            <button
              className="w-full h-11 rounded-[11px] bg-brand-purple text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              onClick={() => { if (selected) onApprove(selected, effectiveName); }}
              disabled={busy || !selected}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitBranch className="h-4 w-4" />}
              Grant license &amp; mint
            </button>
            <p className="text-2xs text-center text-muted-foreground">{footerNote}</p>
          </div>
        </TransactionDialogStates>
      </DialogContent>
    </Dialog>
  );
}
