import { afterEach, describe, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { SWRConfig } from "swr";
import { fetchSession, sessionEmail, useSession } from "./use-session.js";

const original = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = original;
});

function backend(session: unknown) {
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(`${init?.method ?? "GET"} ${input.toString()}`);
    return new Response(JSON.stringify(session), { status: 200 });
  }) as unknown as typeof fetch;
  return calls;
}

const base = { accountId: "a1", publicId: "acc_1", walletAddress: "0x1", emailDeadline: null };

describe("fetchSession", () => {
  test("returns the session the app route answers with", async () => {
    const calls = backend({ ...base, email: "ana@example.com" });
    expect(await fetchSession()).toMatchObject({ email: "ana@example.com" });
    expect(calls).toEqual(["GET /api/session"]);
  });

  test("returns a session without an email as it is and never clears the cookie", async () => {
    const calls = backend({ ...base, email: null });
    expect(await fetchSession()).toMatchObject({ accountId: "a1" });
    expect(calls).toEqual(["GET /api/session"]);
  });

  test("is signed out when there is no session", async () => {
    backend(null);
    expect(await fetchSession()).toBeNull();
  });

  test("throws when the route fails", async () => {
    globalThis.fetch = (async () => new Response("x", { status: 502 })) as unknown as typeof fetch;
    await expect(fetchSession()).rejects.toThrow("Session check failed");
  });
});

describe("sessionEmail", () => {
  test("is the email of the last session seen, and null after a visitor", async () => {
    backend({ ...base, email: "ana@example.com" });
    await fetchSession();
    expect(sessionEmail()).toBe("ana@example.com");
    backend(null);
    await fetchSession();
    expect(sessionEmail()).toBeNull();
  });
});

describe("useSession", () => {
  test("focus and reconnect do not ask the server again", async () => {
    const calls = backend({ ...base, email: "ana@example.com" });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0, focusThrottleInterval: 0 } }, children);
    const { result } = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(result.current.session).not.toBeNull());
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("online"));
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(calls).toEqual(["GET /api/session"]);
  });
});
