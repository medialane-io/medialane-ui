import { test, expect } from "bun:test";
import { MedialaneApiError } from "@medialane/sdk";
import { describeError, UserFacingError, NOT_SUBMITTED, GENERIC } from "./describe-error.js";
import { WrongNetworkError } from "./wallet-error.js";

test("copy the API authored is shown as written", () => {
  const err = new MedialaneApiError(409, "Active offer already exists", undefined, undefined, true);
  expect(describeError(err).message).toBe("Active offer already exists");
});

test("an API body the API did not author never reaches the user", () => {
  const err = new MedialaneApiError(502, "<html>502 Bad Gateway</html>", undefined, undefined, false);
  const notice = describeError(err, "Purchase failed");
  expect(notice.message).not.toContain("html");
  expect(notice.message).toBe("The network is busy right now. Nothing was submitted. Please try again in a moment.");
});

test("an unauthored 4xx falls back to the caller's copy", () => {
  const err = new MedialaneApiError(400, "invalid body: field `x`", undefined, undefined, false);
  expect(describeError(err, "Transfer failed").message).toBe("Transfer failed");
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
  expect(describeError(new Error(raw)).message).toBe(GENERIC);
  expect(describeError(new Error(raw), "Mint failed").message).toBe("Mint failed");
});

test("insufficient balance is named", () => {
  expect(describeError(new Error("insufficient balance for transfer")).title).toBe("Insufficient balance");
});

test("an opaque wallet error suggests another wallet or device", () => {
  expect(describeError({ code: 163 }).message).toContain("different wallet or device");
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
