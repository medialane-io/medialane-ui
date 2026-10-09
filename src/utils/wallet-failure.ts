import type { PasskeySupport } from "./passkey-support.js";

export type WalletFailureKind =
  | "cancelled"
  | "no-passkeys"
  | "unsupported-passkey"
  | "network"
  | "still-deploying"
  | "deployment"
  | "unknown";

export interface WalletFailureNotice {
  kind: WalletFailureKind;
  message: string;
  canRetry: boolean;
}

export const isPasskeyCancelled = (err: unknown): boolean =>
  typeof err === "object" && err !== null && (err as { name?: unknown }).name === "PasskeyCancelledError";

export type PasskeyUnsupportedReason = "no-webauthn" | "no-prf";

export function passkeyUnsupportedReason(err: unknown): PasskeyUnsupportedReason | null {
  if (typeof err !== "object" || err === null) return null;
  const { name, reason } = err as { name?: unknown; reason?: unknown };
  if (name !== "PasskeyUnsupportedError") return null;
  return reason === "no-webauthn" || reason === "no-prf" ? reason : null;
}

const message = (err: unknown): string => (err instanceof Error ? err.message : "");

export function describeWalletFailure(err: unknown, support: PasskeySupport = "unknown"): WalletFailureNotice {
  const raw = message(err);

  if (isPasskeyCancelled(err)) {
    return support === "unavailable"
      ? {
          kind: "no-passkeys",
          message: "Passkeys aren't available in this window. Open Medialane in a regular browser window (not Guest or Incognito) and try again.",
          canRetry: true,
        }
      : {
          kind: "cancelled",
          message:
            "The passkey prompt was closed. Try again to finish setting up your account. If your browser says your device can't be used, open Medialane in a regular browser window (not Guest or Incognito).",
          canRetry: true,
        };
  }

  const unsupported = passkeyUnsupportedReason(err);
  if (unsupported === "no-prf") {
    return {
      kind: "unsupported-passkey",
      message: "Let's save your passkey in another place. Try again and choose your phone or password manager.",
      canRetry: true,
    };
  }
  if (unsupported === "no-webauthn") {
    return {
      kind: "no-passkeys",
      message: "Open Medialane in a regular browser window or on another device to continue.",
      canRetry: false,
    };
  }

  if (/has not appeared|submitted but/i.test(raw)) {
    return {
      kind: "still-deploying",
      message: "Your wallet is still being set up. Give it a minute, then try again. Nothing is lost.",
      canRetry: true,
    };
  }

  if (/deploy/i.test(raw)) {
    return { kind: "deployment", message: "We couldn't finish setting up your wallet. Please try again in a moment.", canRetry: true };
  }

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return { kind: "network", message: "We couldn't reach Medialane. Check your connection and try again.", canRetry: true };
  }

  return { kind: "unknown", message: "We couldn't finish setting up your account. Please try again.", canRetry: true };
}
