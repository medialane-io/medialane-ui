"use client";

import { useCallback, useEffect, useReducer } from "react";
import { describeError } from "./describe-error.js";
import { emailCodeReducer, initialEmailCodeState, type EmailCodeState } from "./email-code.js";

export interface EmailCodeApi {
  requestEmailCode(email: string): Promise<unknown>;
  verifyEmailCode(email: string, code: string): Promise<unknown>;
}

export interface EmailCode {
  state: EmailCodeState;
  setCode(code: string): void;
  send(to?: string): Promise<boolean>;
  fail(message: string): void;
  verify(options?: { code?: string; after?: () => Promise<void> | void }): Promise<boolean>;
  markReady(): void;
}

export function useEmailCode(email: string | null, api: () => EmailCodeApi): EmailCode {
  const [state, dispatch] = useReducer(emailCodeReducer, initialEmailCodeState);

  useEffect(() => {
    if (state.cooldown === 0) return;
    const id = setTimeout(() => dispatch({ type: "tick" }), 1000);
    return () => clearTimeout(id);
  }, [state.cooldown]);

  const send = useCallback(
    async (to = email) => {
      if (!to) return false;
      dispatch({ type: "send-started" });
      try {
        await api().requestEmailCode(to);
        dispatch({ type: "send-succeeded" });
        return true;
      } catch (err) {
        dispatch({ type: "send-failed", message: describeError(err, "Couldn't send the code. Please try again.").message });
        return false;
      }
    },
    [email, api],
  );

  const verify = useCallback<EmailCode["verify"]>(
    async ({ code, after } = {}) => {
      const toVerify = code ?? state.code;
      if (!email || toVerify.length !== 6) return false;
      dispatch({ type: "verify-started" });
      try {
        await api().verifyEmailCode(email, toVerify);
        await after?.();
        return true;
      } catch (err) {
        dispatch({ type: "verify-failed", message: describeError(err, "Incorrect code. Please try again.").message });
        return false;
      }
    },
    [email, state.code, api],
  );

  const setCode = useCallback((code: string) => dispatch({ type: "code-changed", code }), []);
  const markReady = useCallback(() => dispatch({ type: "send-succeeded" }), []);
  const fail = useCallback((message: string) => dispatch({ type: "verify-failed", message }), []);

  return { state, setCode, send, verify, markReady, fail };
}
