import { describe, expect, test } from "bun:test";
import { createAppWallet } from "./app-wallet.js";

type CreateOptions = { publicKey: PublicKeyCredentialCreationOptions };

function capturingNavigator(): CreateOptions[] {
  const seen: CreateOptions[] = [];
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      credentials: {
        create: async (options: CreateOptions) => {
          seen.push(options);
          throw new Error("captured");
        },
        get: async () => null,
      },
    },
  });
  return seen;
}

const wallet = (storedCredentialId: string | null) => {
  const memory = new Map<string, string>();
  if (storedCredentialId) {
    memory.set("test.owner", JSON.stringify({ credentialId: storedCredentialId, ownerPubKey: "0x1", address: "0x2", iv: "", ciphertext: "" }));
  }
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => void memory.set(k, v), removeItem: (k: string) => void memory.delete(k) },
  });
  Object.defineProperty(globalThis, "window", { configurable: true, value: globalThis });
  return createAppWallet({
    appName: "Medialane",
    relyingPartyId: () => "medialane.io",
    storeKey: "test.owner",
    changeEvent: "test-change",
    prfSalt: "salt",
    hkdfInfo: "info",
    provider: () => ({}) as never,
    loadAccountEmail: () => "team@example.com",
  });
};

describe("a new wallet's passkey", () => {
  test("gets its own user id each time, named by the email", async () => {
    const seen = capturingNavigator();
    const { passkeyOwner } = wallet(null);
    await passkeyOwner.createOwnerKey().catch(() => {});
    await passkeyOwner.createOwnerKey().catch(() => {});
    expect(seen).toHaveLength(2);
    expect(seen[0]!.publicKey.user.name).toBe("team@example.com");
    expect([...(seen[0]!.publicKey.user.id as Uint8Array)]).not.toEqual([...(seen[1]!.publicKey.user.id as Uint8Array)]);
  });

  test("is not refused because another wallet's passkey is stored", async () => {
    const seen = capturingNavigator();
    const { passkeyOwner } = wallet(btoa("old-credential"));
    await passkeyOwner.createOwnerKey().catch(() => {});
    expect(seen[0]!.publicKey.excludeCredentials ?? []).toEqual([]);
  });
});
