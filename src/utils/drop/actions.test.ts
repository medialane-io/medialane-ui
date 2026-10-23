import { describe, expect, test } from "bun:test";
import { hash } from "starknet";
import { getCoordinates } from "@medialane/sdk";
import { launchDrop, manageDrop, mintDrop } from "./actions.js";

const DROP = "0x0000000000000000000000000000000000000000000000000000000000000d409";
const intent = { id: "i1", requiresSignature: false, calls: [{ contractAddress: "0x1", entrypoint: "x", calldata: [] }], expiresAt: "" };

function deps(receiptEvents: unknown[]) {
  const sent: { method: string; body: unknown }[] = [];
  const executed: { calls: unknown; opts: unknown }[] = [];
  const api = {
    intents: {
      create: async (method: string, body: unknown) => {
        sent.push({ method, body });
        return intent;
      },
      confirm: async () => ({}),
      syncTransaction: async () => ({ applied: 0, pending: false }),
    },
  };
  return {
    sent,
    executed,
    deps: {
      client: { api, provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", finality_status: "ACCEPTED_ON_L2", events: receiptEvents }) } } as never,
      signer: {
        address: "0x2",
        execute: async (calls: unknown, opts: unknown) => { executed.push({ calls, opts }); return { txHash: "0xtx" }; },
        signTypedData: async () => [],
      },
    },
  };
}

describe("drop actions", () => {
  test("launch creates the drop intent with terms and list, and returns the new drop's address", async () => {
    const created = { from_address: getCoordinates("STARKNET").dropFactory!, keys: [hash.getSelectorFromName("DropCreated"), "0x1", "0x0", "0x2"], data: [DROP] };
    const d = deps([created]);
    const res = await launchDrop(d.deps, {
      owner: "0x2", name: "N", symbol: "N", baseUri: "ipfs://cid/", maxSupply: 10,
      terms: { startTime: 0, endTime: 0, price: "0", paymentToken: "0x0", maxPerWallet: "0" }, allowlistRoot: "0xabc",
    });
    expect(d.sent[0]).toEqual({ method: "create-collection", body: {
      owner: "0x2", name: "N", symbol: "N", baseUri: "ipfs://cid/", service: "drop-collection", maxSupply: "10",
      terms: { startTime: 0, endTime: 0, price: "0", paymentToken: "0x0", maxPerWallet: "0" }, allowlistRoot: "0xabc",
    } });
    expect(d.executed[0]!.opts).toEqual({ intentIds: ["i1"] });
    expect(BigInt(res.collection)).toBe(BigInt(DROP));
  });

  test("mint sends the quantity and proof and reads back the token ids", async () => {
    const claimed = { from_address: DROP, keys: [hash.getSelectorFromName("Claimed"), "0x2"], data: ["0x2", "0x0", "0x5", "0x0", "0x0", "0x0"] };
    const d = deps([claimed]);
    const res = await mintDrop(d.deps, { claimer: "0x2", collection: DROP, quantity: 2n, proof: ["0xa"] });
    expect(d.sent[0]).toEqual({ method: "drop-claim", body: { claimer: "0x2", collection: DROP, quantity: "2", proof: ["0xa"] } });
    expect(res).toEqual({ txHash: "0xtx", tokenIds: ["5", "6"] });
  });

  test("manage sends the action through a manage intent", async () => {
    const d = deps([]);
    await manageDrop(d.deps, { owner: "0x2", collection: DROP, action: "set_allowlist_root", root: "0x0" });
    expect(d.sent[0]!.method).toBe("drop-manage");
  });
});
