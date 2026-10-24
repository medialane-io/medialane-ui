"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./button.js";
import { useMedialaneApp } from "./medialane-app.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { useTransaction } from "../utils/use-transaction.js";

export interface PopBurnButtonProps {
  collectionAddress: string;
  tokenId: string;
  onBurned?: () => void;
}

export function PopBurnButton({ collectionAddress, tokenId, onBurned }: PopBurnButtonProps) {
  const app = useMedialaneApp();
  const [confirming, setConfirming] = useState(false);
  const tx = useTransaction();
  const busy = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  useEffect(() => {
    if (tx.phase === "success") onBurned?.();
  }, [tx.phase, onBurned]);

  if (tx.phase === "success") {
    return <p className="text-xs text-muted-foreground">Removed from your wallet.</p>;
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setConfirming(true)}>
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        Remove from my wallet
      </Button>
    );
  }

  const remove = () =>
    void tx.run(async (signer) => {
      await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-burn", { owner: signer.address, collection: collectionAddress, tokenId: String(tokenId) }));
    });

  return (
    <div className="space-y-2 rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">
        This permanently destroys this credential. You won&apos;t be able to claim it again.
      </p>
      {tx.phase === "error" && <p className="text-xs text-destructive">{tx.error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" disabled={busy} onClick={() => setConfirming(false)}>
          Keep it
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" disabled={busy} onClick={remove}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Remove"}
        </Button>
      </div>
    </div>
  );
}
