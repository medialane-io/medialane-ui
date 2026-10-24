"use client";

import { useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { popClaimState, type PopClaimInfo } from "@medialane/sdk/starknet";
import { Button } from "./button.js";
import { TransactionDialog } from "./transaction-dialog.js";
import { TransactionDone } from "./transaction-done.js";
import { RewardEarned } from "./rewards/reward-earned.js";
import { useMedialaneApp } from "./medialane-app.js";
import { claimProofFor } from "../utils/drop/claim-proof.js";
import { runIntentCalls } from "../utils/run-intent-calls.js";
import { usePopClaimStatus } from "../utils/use-pop.js";
import { useTransaction } from "../utils/use-transaction.js";

export function PopClaimButton({ collectionAddress }: { collectionAddress: string }) {
  const app = useMedialaneApp();
  const { walletAddress } = app;
  const { hasClaimed, mutate } = usePopClaimStatus(collectionAddress, walletAddress);
  const [proof, setProof] = useState<string[] | null>(null);
  const [info, setInfo] = useState<PopClaimInfo | null>(null);
  const tx = useTransaction();
  const busy = tx.phase === "preparing" || tx.phase === "submitting" || tx.phase === "confirming";

  useEffect(() => {
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
    } catch {
      storage = null;
    }
    setProof(claimProofFor(storage, collectionAddress, window.location.hash));
    app.getClient().api.chainReads.popClaimInfo(collectionAddress)
      .then(setInfo)
      .catch(() => setInfo(null));
  }, [app, collectionAddress]);

  useEffect(() => {
    if (tx.phase === "success") void mutate();
  }, [tx.phase, mutate]);

  const state = popClaimState({
    hasClaimed,
    proof,
    wallet: walletAddress,
    info: info && { ...info, now: Math.floor(Date.now() / 1000) },
  });

  const claim = () => {
    if (!proof) return;
    void tx.run(async (signer) => {
      await runIntentCalls(signer, () => app.getClient().api.intents.create("pop-claim", { claimer: signer.address, collection: collectionAddress, proof }));
    });
  };

  return (
    <>
      {(state === "ready" || busy) && (
        <Button size="sm" className="w-full gap-1.5" onClick={claim} disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />}
          {busy ? "Claiming…" : "Claim credential"}
        </Button>
      )}
      <TransactionDialog tx={tx} title="Claim credential" workingLabel="Claiming your credential…" firstStepLabel="Prepare claim">
        <TransactionDone
          tx={tx}
          name="Credential"
          title="Credential claimed!"
          description="Your proof of participation is now on-chain."
          footer={<RewardEarned actionType="claim_pop" />}
        />
      </TransactionDialog>
    </>
  );
}
