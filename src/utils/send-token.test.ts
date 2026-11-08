import { expect, test } from "bun:test";
import { sendToken } from "./send-token.js";

test("a token send is built by the client and runs its own calls", async () => {
  const created: Array<{ kind: string; params: unknown }> = [];
  const executed: unknown[] = [];
  const call = { contractAddress: "0x1", entrypoint: "transfer", calldata: ["0x2", "5", "0"] };
  const client = {
    createIntent: async (kind: string, params: unknown) => (created.push({ kind, params }), { id: "i1", requiresSignature: false, calls: [call] }),
  };
  const signer = { address: "0xabc", execute: async (calls: unknown, opts: unknown) => (executed.push({ calls, opts }), { txHash: "0xtx" }) };
  const result = await sendToken(signer, client as never, { token: "0xtoken", recipient: "0xto", amount: 5n });
  expect(result.txHash).toBe("0xtx");
  expect(created).toEqual([{ kind: "transfer-token", params: { owner: "0xabc", token: "0xtoken", recipient: "0xto", amount: "5" } }]);
  expect(executed).toEqual([{ calls: [call], opts: { intentIds: ["i1"] } }]);
});
