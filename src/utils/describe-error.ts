import { MedialaneApiError, PasskeyCancelledError, UserFacingError } from "@medialane/sdk";
import { WrongNetworkError, isBareExecuteFailure, isUserRejectedRequest, collectErrorText } from "./wallet-error.js";
import { describeWalletFailure, passkeyUnsupportedReason } from "./wallet-failure.js";

export const NOT_SUBMITTED = "Request not completed. Nothing was submitted.";
export const NETWORK_BUSY = "Our service is very busy right now. Please try again in a minute.";
export const CONNECTION_FAILED = "We couldn't connect. Check your internet connection and try again.";

export interface ErrorNotice {
  title?: string;
  message: string;
  description?: string;
  isUserRejection: boolean;
  retryable: boolean;
}

const notice = (title: string | undefined, message: string, description?: string, retryable = true): ErrorNotice => ({
  title,
  message,
  description,
  isUserRejection: false,
  retryable,
});

function unexplained(error: unknown): ErrorNotice {
  const id = (error as { requestId?: unknown } | null)?.requestId;
  const reference = (typeof id === "string" && id !== "" ? id : crypto.randomUUID()).slice(0, 8);
  console.error("[medialane] unexplained failure", { reference, error });
  return notice(undefined, `Share reference ${reference} with support.`);
}

function isBusy(error: unknown): boolean {
  return /-32001|unable to complete request|rate.?limit|too many requests/i.test(collectErrorText(error));
}

function isConnectionFailure(error: unknown): boolean {
  return /failed to fetch|fetch failed|load failed|networkerror when attempting/i.test(collectErrorText(error));
}

function apiReason(error: MedialaneApiError): string | undefined {
  const body = error.details;
  if (body && typeof body === "object" && "error" in body) {
    const reason = (body as { error?: unknown }).error;
    if (typeof reason === "string" && reason.trim() !== "") return reason;
  }
  return undefined;
}

export function describeError(error: unknown): ErrorNotice {
  if (error instanceof PasskeyCancelledError || isUserRejectedRequest(error)) {
    const unclear = isBareExecuteFailure(error) || error instanceof PasskeyCancelledError;
    return {
      title: "Request not completed",
      message: NOT_SUBMITTED,
      description: unclear
        ? "Your wallet didn't complete this request. You may have closed or declined it, it may need extra verification such as 2FA before it can sign, or it may have hit a temporary network hiccup. Try again in a moment."
        : "Your wallet didn't complete this request. You may have closed or declined it, or it may need extra verification before it can sign.",
      isUserRejection: true,
      retryable: true,
    };
  }

  if (passkeyUnsupportedReason(error)) {
    return notice("Passkey not supported", describeWalletFailure(error).message);
  }

  if (error instanceof WrongNetworkError) {
    return notice(
      "Wrong network",
      "Your wallet is connected to the wrong network. Nothing was submitted.",
      "Switch your wallet to Starknet Mainnet, then try again.",
    );
  }

  if (error instanceof UserFacingError) {
    return notice(undefined, error.message, undefined, error.retryable);
  }

  if (error instanceof MedialaneApiError) {
    if (error.status === 429) return notice("Service busy", NETWORK_BUSY);
    const reason = error.status >= 500 ? undefined : apiReason(error);
    return reason ? notice(undefined, reason) : unexplained(error);
  }

  if (isBusy(error)) {
    return notice("Service busy", NETWORK_BUSY);
  }

  if (isConnectionFailure(error)) {
    return notice("Connection problem", CONNECTION_FAILED);
  }

  const text = collectErrorText(error).toLowerCase();
  if (text.includes("insufficient") && /balance|allowance|funds/.test(text)) {
    return notice(
      "Insufficient balance",
      "You don't have enough balance to complete this transaction.",
      "Add funds to your wallet, then try again.",
    );
  }

  return unexplained(error);
}

export { UserFacingError };
