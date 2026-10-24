"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";
import { Button } from "./button.js";
import { fireConfetti } from "../utils/media-wallet/confetti.js";
import type { useTransaction } from "../utils/use-transaction.js";

export interface TransactionDialogProps {
  tx: Pick<ReturnType<typeof useTransaction>, "phase" | "error" | "reset">;
  title: string;
  workingLabel: string;
  firstStepLabel?: string;
  children?: ReactNode;
}

const ACTIVE_STEP = { preparing: 0, submitting: 1, confirming: 2 } as const;

export function TransactionDialog({ tx, title, workingLabel, firstStepLabel = "Prepare", children }: TransactionDialogProps) {
  const { phase, error, reset } = tx;
  const working = phase === "preparing" || phase === "submitting" || phase === "confirming";
  const success = phase === "success";
  const failed = phase === "error";
  const steps = [firstStepLabel, "Submit transaction", "Confirm transaction"];

  const confettiFired = useRef(false);
  useEffect(() => {
    if (success && !confettiFired.current) {
      confettiFired.current = true;
      fireConfetti();
    }
    if (!success) confettiFired.current = false;
  }, [success]);

  return (
    <Dialog open={phase !== "idle"} modal onOpenChange={(open) => { if (!open && !working) reset(); }}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={working ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={working ? (e) => e.preventDefault() : undefined}
        {...(working ? { hideClose: true } : {})}
      >
        <DialogTitle className="sr-only">{working ? workingLabel : title}</DialogTitle>

        {working && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold">{workingLabel}</p>
              <p className="text-sm text-muted-foreground">
                {phase === "confirming" ? "Waiting for block confirmation" : "Submitting transaction"}
              </p>
            </div>
            <ol className="w-full space-y-2 rounded-xl border border-border/60 bg-muted/30 p-4">
              {steps.map((label, i) => {
                const active = i === ACTIVE_STEP[phase];
                const done = i < ACTIVE_STEP[phase];
                return (
                  <li key={label} data-step aria-current={active ? "step" : undefined} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className={done ? "text-sm text-foreground" : active ? "text-sm font-medium text-primary" : "text-sm text-muted-foreground"}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="text-center text-xs text-muted-foreground">This usually takes 10–30 seconds. Do not close this window.</p>
          </div>
        )}

        {success && children}

        {failed && (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-9 w-9 text-destructive" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-xl font-bold">Something went wrong</p>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">{error ?? "We couldn't complete that. Please try again."}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={reset}>
              Try again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
