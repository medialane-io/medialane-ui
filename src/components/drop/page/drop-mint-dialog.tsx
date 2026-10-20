"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { ActionDialog } from "../../action-dialog.js";
import { GradientButton } from "../../gradient-button.js";
import { Button } from "../../button.js";
import { describeError } from "../../../utils/describe-error.js";

type Step = { kind: "confirm" } | { kind: "minting" } | { kind: "done"; tokenIds: string[] } | { kind: "error"; message: string };

export function DropMintDialog({
  open, onClose, name, quantity, totalText, onMint, portfolioHref,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  quantity: bigint;
  totalText: string | null;
  onMint: () => Promise<{ tokenIds: string[] }>;
  portfolioHref: string;
}) {
  const [step, setStep] = useState<Step>({ kind: "confirm" });
  const mint = async () => {
    setStep({ kind: "minting" });
    try {
      setStep({ kind: "done", tokenIds: (await onMint()).tokenIds });
    } catch (err) {
      setStep({ kind: "error", message: describeError(err, "The mint didn't go through. Please try again.").message });
    }
  };
  const close = () => {
    if (step.kind === "minting") return;
    setStep({ kind: "confirm" });
    onClose();
  };
  return (
    <ActionDialog open={open} onClose={close} width={460}>
      <div className="space-y-5 p-6">
        {step.kind === "confirm" && (
          <>
            <h2 className="text-lg font-semibold">Mint {quantity.toString()} from {name}</h2>
            {totalText && <p className="text-sm text-muted-foreground">{totalText}</p>}
            <GradientButton big onClick={() => void mint()}>Confirm mint</GradientButton>
          </>
        )}
        {step.kind === "minting" && <h2 className="flex items-center gap-2 text-lg font-semibold"><Loader2 className="h-4 w-4 animate-spin" />Minting…</h2>}
        {step.kind === "done" && (
          <>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-green-500" />Minted</h2>
            <Button asChild><a href={portfolioHref}>View in portfolio</a></Button>
          </>
        )}
        {step.kind === "error" && (
          <>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><XCircle className="h-4 w-4 text-destructive" />Not minted</h2>
            <p className="text-sm text-muted-foreground">{step.message}</p>
            <Button onClick={() => void mint()}>Try again</Button>
          </>
        )}
      </div>
    </ActionDialog>
  );
}
