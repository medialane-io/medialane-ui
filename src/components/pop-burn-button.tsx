"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./button.js";
import { useMedialaneApp } from "./medialane-app.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { useTransaction } from "../utils/use-transaction.js";
import { useT } from "../i18n/provider.js";

export interface PopBurnButtonProps {
  collectionAddress: string;
  tokenId: string;
  onBurned?: () => void;
}

export function PopBurnButton({ collectionAddress, tokenId, onBurned }: PopBurnButtonProps) {
  const t = useT();
  const app = useMedialaneApp();
  const [confirming, setConfirming] = useState(false);
  const tx = useTransaction();
  const busy = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  useEffect(() => {
    if (tx.phase === "success") onBurned?.();
  }, [tx.phase, onBurned]);

  if (tx.phase === "success") {
    return <p className="text-xs text-muted-foreground">{t("Removed from your wallet.")}</p>;
  }

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setConfirming(true)}>
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        {t("Remove from my wallet")}
      </Button>
    );
  }

  const remove = () =>
    void tx.run(async (signer) => {
      await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-burn", { owner: signer.address, collection: collectionAddress, tokenId: String(tokenId) }));
    });

  return (
    <div className="panel space-y-2 p-3">
      <p className="text-xs text-muted-foreground">
        {t("Burning removes this certificate permanently.")}
      </p>
      {tx.phase === "error" && <p className="text-xs text-destructive">{tx.error}</p>}
      <div className="flex gap-2">
        <Button variant="soft" size="sm" className="flex-1" disabled={busy} onClick={() => setConfirming(false)}>
          {t("Keep it")}
        </Button>
        <Button variant="destructive" size="sm" className="flex-1" disabled={busy} onClick={remove}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t("Remove")}
        </Button>
      </div>
    </div>
  );
}
