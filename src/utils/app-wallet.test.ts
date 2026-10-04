import { describe, expect, test } from "bun:test";
import { decodeCredentialId, stableUserId } from "./app-wallet.js";

describe("the passkey user id", () => {
  test("is the SHA-256 of the email, so the same person gets the same passkey identity on every device", async () => {
    const a = await stableUserId("team@example.com");
    const b = await stableUserId("team@example.com");
    expect(a.length).toBe(32);
    expect([...a]).toEqual([...b]);
  });

  test("differs between emails", async () => {
    const a = await stableUserId("a@example.com");
    const b = await stableUserId("b@example.com");
    expect([...a]).not.toEqual([...b]);
  });
});

describe("a stored credential id", () => {
  test("decodes from base64 back to its bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 255]);
    const encoded = btoa(String.fromCharCode(...bytes));
    expect([...decodeCredentialId(encoded)]).toEqual([...bytes]);
  });
});
