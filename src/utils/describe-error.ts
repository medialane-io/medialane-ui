import { MedialaneApiError, PasskeyCancelledError } from "@medialane/sdk";
import {
  WrongNetworkError,
  isBareExecuteFailure,
  isUserRejectedRequest,
  collectErrorText,
} from "./wallet-error.js";

export const NOT_SUBMITTED = "Request not completed. Nothing was submitted.";
export const GENERIC = "Something went wrong. Please try again.";
export const NETWORK_BUSY =
  "The network is busy right now. Nothing was submitted. Please try again in a moment.";

export interface ErrorNotice {
  title: string;
  message: string;
  description?: string;
  isUserRejection: boolean;
}

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

function isTransientStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function isTransientNetworkError(text: string): boolean {
  return /-32001|unable to complete request|service unavailable|temporarily unavailable|rate.?limit|too many requests|gateway time-?out|bad gateway|failed to fetch|fetch failed|network ?error|load failed/i.test(
    text,
  );
}

export function describeError(error: unknown, fallback?: string): ErrorNotice {
  if (error instanceof PasskeyCancelledError) {
    return {
      title: "Request not completed",
      message: NOT_SUBMITTED,
      description: "Your device did not confirm this request. Nothing was submitted. Try again when you are ready.",
      isUserRejection: true,
    };
  }

  if (isBareExecuteFailure(error)) {
    return {
      title: "Request not completed",
      message: NOT_SUBMITTED,
      description: "Your wallet didn't complete this request. This usually means you closed or declined it, your wallet needs extra verification (like 2FA) before it can sign, or your wallet hit a temporary network hiccup. Nothing was submitted. Try again in a moment.",
      isUserRejection: true,
    };
  }

  if (isUserRejectedRequest(error)) {
    return {
      title: "Request not completed",
      message: NOT_SUBMITTED,
      description: "Your wallet didn't complete this request. You may have closed or declined it, or it may need extra verification before it can sign. Nothing was submitted.",
      isUserRejection: true,
    };
  }

  if (error instanceof WrongNetworkError) {
    return {
      title: "Wrong network",
      message: "Your wallet is connected to the wrong network. Nothing was submitted.",
      description: "Switch your wallet to Starknet Mainnet, then try again.",
      isUserRejection: false,
    };
  }

  if (error instanceof UserFacingError) {
    return { title: "Something went wrong", message: error.message, isUserRejection: false };
  }

  if (error instanceof MedialaneApiError) {
    if (error.isAuthored) {
      return { title: "Something went wrong", message: error.message, isUserRejection: false };
    }
    if (isTransientStatus(error.status)) {
      return { title: "Network busy", message: NETWORK_BUSY, isUserRejection: false };
    }
    return { title: "Something went wrong", message: fallback ?? GENERIC, isUserRejection: false };
  }

  const raw = collectErrorText(error);

  if (isTransientNetworkError(raw)) {
    return { title: "Network busy", message: NETWORK_BUSY, isUserRejection: false };
  }

  const lower = raw.toLowerCase();
  if (lower.includes("insufficient") && /balance|allowance|funds/.test(lower)) {
    return {
      title: "Insufficient balance",
      message: "You don't have enough balance to complete this transaction.",
      isUserRejection: false,
    };
  }

  const stack = error instanceof Error && typeof error.stack === "string" ? error.stack.toLowerCase() : "";
  if (lower.includes("validation failure") && (lower.includes("jscontrollererror") || stack.includes("jscontrollererror"))) {
    return {
      title: "Not enough gas",
      message: "Your wallet doesn't have enough STRK (or ETH) to pay for this transaction's gas fee.",
      description: "Add funds to your wallet, then try again.",
      isUserRejection: false,
    };
  }

  if (/unknown_error/i.test(raw) || (typeof error === "object" && error !== null && (error as { code?: unknown }).code === 163)) {
    return {
      title: "Something went wrong",
      message: "Your wallet couldn't complete this transaction. Nothing was submitted. Try again, or try a different wallet or device if it keeps happening.",
      isUserRejection: false,
    };
  }

  return { title: "Something went wrong", message: fallback ?? GENERIC, isUserRejection: false };
}
