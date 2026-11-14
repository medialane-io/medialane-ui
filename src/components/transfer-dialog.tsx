"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog.js";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form.js";
import { Input } from "./input.js";
import { Alert, AlertDescription } from "./alert.js";
import { MarketplaceConfirmStep, MarketplaceDialogHero } from "./marketplace-dialog-primitives.js";
import { TransactionDialogStates } from "./transaction-dialog-states.js";
import { isBusyPhase, type TransactionPhase } from "../utils/use-transaction.js";
import { successMessages } from "../utils/success-messages.js";

const schema = z.object({
  toAddress: z
    .string()
    .min(1, "Recipient address is required")
    .regex(/^0x[0-9a-fA-F]{1,64}$/, "Must be a valid Starknet address (0x followed by hex characters)"),
});

type FormValues = z.infer<typeof schema>;

type Step = "form" | "confirm";

export interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string;
  tokenName?: string;
  tokenImage?: string | null;
  hasActiveListing?: boolean;
  walletAddress?: string | null;
  canTransfer: boolean;
  connectLabel: string;
  footerNote: string;
  tx: {
    phase: TransactionPhase;
    txHash: string | null;
    error: string | null;
    retryable?: boolean;
    reset: () => void;
  };
  onTransfer: (toAddress: string) => void;
  onSuccess?: () => void;
}

export function TransferDialog({
  open,
  onOpenChange,
  tokenId,
  tokenName,
  tokenImage,
  hasActiveListing = false,
  walletAddress,
  canTransfer,
  connectLabel,
  footerNote,
  tx,
  onTransfer,
  onSuccess,
}: TransferDialogProps) {
  const { phase, txHash, error, retryable = true, reset } = tx;
  const busy = isBusyPhase(phase);
  const [step, setStep] = useState<Step>("form");
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { toAddress: "" },
  });

  const resetDialog = () => {
    reset();
    form.reset();
    setPendingAddress(null);
    setStep("form");
  };

  useEffect(() => {
    if (open) resetDialog();
  }, [open]);

  const close = () => {
    resetDialog();
    onOpenChange(false);
  };

  const handleClose = (value: boolean) => {
    if (!value && !busy && phase !== "success") close();
  };

  const onSubmit = (values: FormValues) => {
    if (walletAddress) {
      try {
        if (BigInt(values.toAddress) === BigInt(walletAddress)) {
          form.setError("toAddress", { message: "Cannot transfer to yourself" });
          return;
        }
      } catch {
        void 0;
      }
    }
    if (!canTransfer) return;
    setPendingAddress(values.toAddress);
    setStep("confirm");
  };

  const displayName = tokenName || `Token #${tokenId}`;
  const recipientShort = pendingAddress ? `${pendingAddress.slice(0, 8)}…${pendingAddress.slice(-6)}` : "";

  const footer = (
    <div className="flex items-start justify-center gap-1.5">
      <ShieldCheck className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      <p className="text-2xs text-center text-muted-foreground">{footerNote}</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100%-6px)] sm:max-w-md p-0 overflow-hidden gap-0 rounded-2xl flex flex-col max-h-[92svh]">
        <DialogTitle className="sr-only">Transfer {displayName}</DialogTitle>
        <DialogDescription className="sr-only">
          Enter a recipient Starknet address to transfer this asset onchain.
        </DialogDescription>

        <TransactionDialogStates
          phase={phase}
          asset={{ name: displayName, image: tokenImage }}
          statusMessage="Confirming on Starknet…"
          txHash={txHash}
          error={error}
          success={successMessages.transferred({ name: displayName, to: recipientShort })}
          successActions={[{ label: "Done", onClick: () => { close(); onSuccess?.(); } }]}
          errorTitle="Transfer failed"
          errorDescription="The transaction was submitted, but the transfer could not be completed."
          onRetry={retryable ? () => { reset(); setStep("form"); } : undefined}
          onDone={close}
        >
          <MarketplaceDialogHero
            tokenImage={tokenImage}
            tokenName={tokenName}
            tokenId={tokenId}
            fallbackIcon={<ArrowRightLeft className="h-12 w-12 text-brand-blue/30" />}
          />
          {step === "confirm" ? (
            <>
              <div className="flex items-end justify-between px-6 pt-3 pb-1">
                <div className="min-w-0">
                  <p className="font-bold text-lg leading-tight truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums truncate">→ {recipientShort}</p>
                </div>
              </div>
              <MarketplaceConfirmStep
                description="Transfer this asset?"
                error={error}
                secondaryLabel="Back"
                onSecondary={() => { reset(); setStep("form"); }}
                primaryLabel="Transfer"
                onPrimary={() => { if (pendingAddress) onTransfer(pendingAddress); }}
                primaryIcon={<ArrowRightLeft className="h-4 w-4" />}
                footer={footer}
              />
            </>
          ) : (
            <div className="px-5 pb-4 pt-3 space-y-3">
              <p className="font-bold text-base leading-tight truncate">{displayName}</p>

              {hasActiveListing && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This token has an active listing. Cancelling the listing first keeps the sale from completing after the transfer.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Transfers are final and recorded onchain.
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField
                    control={form.control}
                    name="toAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x…" autoComplete="off" spellCheck={false} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="pt-1 space-y-2">
                    <div className="btn-border-animated p-[1px] rounded-xl">
                      <button
                        type="submit"
                        disabled={!canTransfer}
                        className="w-full h-11 rounded-[11px] flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] bg-transparent"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        {canTransfer ? "Transfer" : connectLabel}
                      </button>
                    </div>
                    {footer}
                  </div>
                </form>
              </Form>
            </div>
          )}
        </TransactionDialogStates>
      </DialogContent>
    </Dialog>
  );
}
