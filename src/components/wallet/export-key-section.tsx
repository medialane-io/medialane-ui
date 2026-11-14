"use client";

import { useState, type ReactNode } from "react";
import { KeyRound, Copy, Check, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { encodeRecoveryKey, type SealedOwner } from "@medialane/sdk/starknet";
import { describeError } from "../../utils/describe-error.js";
import { Button } from "../button.js";
import { Alert, AlertDescription } from "../alert.js";

export interface ExportKeySectionProps {
  loadSealed: () => SealedOwner | null;
  unlock: (sealed: SealedOwner) => Promise<string>;
  actions?: ReactNode;
}

export function ExportKeySection({ loadSealed, unlock, actions }: ExportKeySectionProps) {
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      const sealed = loadSealed();
      if (!sealed) {
        setError("This browser has no wallet key stored.");
        return;
      }
      setRecoveryKey(encodeRecoveryKey({ walletAddress: sealed.address, privateKey: await unlock(sealed) }));
    } catch (err) {
      setError(describeError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!recoveryKey) return;
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hide = () => {
    setRecoveryKey(null);
    setCopied(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold">Recovery key</p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Used to sign in on a new phone or browser.
        </p>
      </div>

      {recoveryKey ? (
        <>
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription className="text-xs leading-relaxed">
              <span className="font-semibold">The recovery key gives full control of the wallet.</span>
            </AlertDescription>
          </Alert>
          <code className="block break-all rounded-xl bg-muted px-3 py-2.5 font-mono text-xs select-all">
            {recoveryKey}
          </code>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={copy} variant="outline" size="sm">
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy key"}
            </Button>
            <Button onClick={hide} variant="ghost" size="sm">
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Hide
            </Button>
            {actions}
          </div>
        </>
      ) : (
        <>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={reveal} disabled={busy} variant="outline" size="sm">
              {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <KeyRound className="mr-1.5 h-3.5 w-3.5" />}
              Show recovery key
            </Button>
            {actions}
          </div>
        </>
      )}
    </div>
  );
}
