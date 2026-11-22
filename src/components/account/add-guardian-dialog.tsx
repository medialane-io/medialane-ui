"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { isValidStarknetAddress, type SealedOwner } from "@medialane/sdk/starknet";
import { Button } from "../button.js";
import { Input } from "../input.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../dialog.js";
import { describeError } from "../../utils/describe-error.js";
import type { GuardianWallet } from "./wallet-types.js";
import { useT } from "../../i18n/provider.js";

export interface AddGuardianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sealed: SealedOwner;
  onAdded: () => void;
  wallet: Pick<GuardianWallet, "setFirstGuardian">;
}

export function AddGuardianDialog({ open, onOpenChange, sealed, onAdded, wallet }: AddGuardianDialogProps) {
  const t = useT();
  const [pubkey, setPubkey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = pubkey.trim();
    if (!isValidStarknetAddress(trimmed)) {
      setError("Enter a valid Stark-curve public key.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await wallet.setFirstGuardian(sealed, trimmed);
      onOpenChange(false);
      setPubkey("");
      onAdded();
    } catch (e) {
      setError(describeError(e).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> {t("Add a guardian")}
          </DialogTitle>
          <DialogDescription>
            {t("Paste the public key of a trusted wallet.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={pubkey}
            onChange={(e) => setPubkey(e.target.value)}
            placeholder="0x…"
            disabled={busy}
            className="font-mono text-xs"
            onKeyDown={(e) => e.key === "Enter" && pubkey.trim() && void handleAdd()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleAdd} disabled={busy || !pubkey.trim()} className="w-full">
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? t("Confirm with passkey…") : t("Add guardian")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
