import type { PasskeySupport } from "./passkey-support.js";
import { msg } from "../i18n/translate.js";

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
          message: msg("Open Medialane in a regular browser window."),
          canRetry: true,
        }
      : {
          kind: "cancelled",
          message:
            msg("The passkey prompt was closed."),
          canRetry: true,
        };
  }

  const unsupported = passkeyUnsupportedReason(err);
  if (unsupported === "no-prf") {
    return {
      kind: "unsupported-passkey",
      message: msg("Update the browser and try again."),
      canRetry: true,
    };
  }
  if (unsupported === "no-webauthn") {
    return {
      kind: "no-passkeys",
      message: msg("Open Medialane in a regular browser window."),
      canRetry: false,
    };
  }

  if (/has not appeared|submitted but/i.test(raw)) {
    return {
      kind: "still-deploying",
      message: msg("The wallet is still being set up."),
      canRetry: true,
    };
  }

  if (/deploy/i.test(raw)) {
    return { kind: "deployment", message: msg("Try again in a moment."), canRetry: true };
  }

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return { kind: "network", message: msg("Check the connection and try again."), canRetry: true };
  }

  return { kind: "unknown", message: msg("Try again."), canRetry: true };
}
