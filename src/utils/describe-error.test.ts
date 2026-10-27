import { describe, test, expect } from "bun:test";
import { MedialaneApiError } from "@medialane/sdk";
import { describeError, UserFacingError, NOT_SUBMITTED, NETWORK_BUSY, CONNECTION_FAILED } from "./describe-error.js";
const REFERENCE = /^Share reference [0-9a-f-]{8} with support\.$/;
import { WrongNetworkError } from "./wallet-error.js";

test("the reason the API gave is shown as written", () => {
  const err = new MedialaneApiError(409, "Active offer already exists", undefined, { error: "Active offer already exists" });
  expect(describeError(err).message).toBe("Active offer already exists");
});

test("a gateway body never reaches the user", () => {
  const err = new MedialaneApiError(502, "<html>502 Bad Gateway</html>", undefined, "<html>502 Bad Gateway</html>");
  const notice = describeError(err);
  expect(notice.message).not.toContain("html");
  expect(notice.message).toMatch(REFERENCE);
});

test("a server error never reads as a busy network", () => {
  const err = new MedialaneApiError(500, "boom", undefined, { error: "Internal server error" });
  expect(describeError(err).message).toMatch(REFERENCE);
});

test("only a rate limit reads as busy", () => {
  expect(describeError(new MedialaneApiError(429, "slow down", undefined, {})).message).toBe(NETWORK_BUSY);
  expect(describeError(new Error("RPC: -32001 unable to complete request")).message).toBe(NETWORK_BUSY);
  expect(describeError(new Error("Gas sponsorship is temporarily unavailable")).message).toMatch(REFERENCE);
});

test("a request the browser could not send reads as a connection problem", () => {
  expect(describeError(new TypeError("Load failed")).message).toBe(CONNECTION_FAILED);
  expect(describeError(new TypeError("Failed to fetch")).message).toBe(CONNECTION_FAILED);
  expect(describeError(new TypeError("Failed to fetch")).message).not.toContain("Nothing was submitted");
});

test("a 4xx with no reason reads as unexplained", () => {
  const err = new MedialaneApiError(400, "invalid body: field `x`", undefined, { detail: "field x" });
  expect(describeError(err).message).toMatch(REFERENCE);
});

test("copy the app authored for a user is shown as written", () => {
  expect(describeError(new UserFacingError("Secure your account first")).message)
    .toBe("Secure your account first");
});

test("a declined or bare wallet failure reads as nothing submitted", () => {
  expect(describeError(new Error("execute failed")).isUserRejection).toBe(true);
  expect(describeError(new Error("execute failed")).message).toBe(NOT_SUBMITTED);
  expect(describeError(new Error("User rejected request")).message).toBe(NOT_SUBMITTED);
});

test("wrong network is named", () => {
  expect(describeError(new WrongNetworkError()).title).toBe("Wrong network");
});

test("an unrecognised error never shows its own text", () => {
  const raw = "Mint intent returned no calls";
  expect(describeError(new Error(raw)).message).toMatch(REFERENCE);
});

test("insufficient balance is named", () => {
  expect(describeError(new Error("insufficient balance for transfer")).title).toBe("Insufficient balance");
});

test("a bare 'Execute failed' names all three real causes, not just a decline", () => {
  const notice = describeError(new Error("Execute failed"));
  expect(notice.isUserRejection).toBe(true);
  expect(notice.description).toContain("temporary network hiccup");
  expect(notice.description).toContain("2FA");
});

test("an explicit rejection phrase keeps the decline-focused copy", () => {
  const notice = describeError(new Error("User rejected the request"));
  expect(notice.isUserRejection).toBe(true);
  expect(notice.description).toContain("closed or declined it");
  expect(notice.description).not.toContain("temporary network hiccup");
});

describe("a passkey that can't be used for a wallet", () => {
  const unsupported = (reason: string) => Object.assign(new Error("unsupported"), { name: "PasskeyUnsupportedError", reason });

  test("no-prf gets the same message as the wallet step, not the fallback", () => {
    const notice = describeError(unsupported("no-prf"));
    expect(notice.message).toBe("Update your browser, or open Medialane on another device, then try again.");
    expect(notice.isUserRejection).toBe(false);
  });

  test("no-webauthn says passkeys aren't available here", () => {
    expect(describeError(unsupported("no-webauthn")).message).toBe(
      "Open Medialane in a regular browser window or on another device to continue.",
    );
  });
});

test("a refused sponsored transaction shows the server's reason and cannot be retried", async () => {
  const { SponsoredCallRejectedError } = await import("@medialane/sdk/starknet");
  const notice = describeError(new SponsoredCallRejectedError("the server's reason", { code: "not_executable" }));
  expect(notice.message).toBe("the server's reason");
  expect(notice.retryable).toBe(false);
});

test("a declined fee prompt can be retried", () => {
  const declined = describeError(new UserFacingError("This action can't be sponsored"));
  expect(declined.message).toBe("This action can't be sponsored");
  expect(declined.retryable).toBe(true);
});

test("a temporary failure can be retried", () => {
  expect(describeError(new Error("boom")).retryable).toBe(true);
  expect(describeError(new MedialaneApiError(429, "slow", undefined, {})).retryable).toBe(true);
});

test("an unexplained API failure shows the backend request id as its reference", () => {
  const err = new MedialaneApiError(500, "boom", undefined, {}, "/v1/x", undefined, "a1b2c3d4-0000-0000-0000-000000000000");
  expect(describeError(err).message).toBe("Share reference a1b2c3d4 with support.");
});
