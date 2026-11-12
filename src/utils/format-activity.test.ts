import { expect, test } from "bun:test";
import type { ApiActivity } from "@medialane/sdk";
import { formatActivity } from "./format-activity.js";

const resolve = (uri: string | null | undefined) => (uri ? `resolved:${uri}` : null);

test("formatActivity resolves the token image with the given resolver", () => {
  const event = { type: "sale", chain: "STARKNET", nftContract: "0xc", nftTokenId: "1", txHash: null, timestamp: new Date().toISOString(), token: { name: "A", image: "ipfs://Qm1", animationUrl: null } } as unknown as ApiActivity;
  expect(formatActivity(event, resolve).image).toBe("resolved:ipfs://Qm1");
});
