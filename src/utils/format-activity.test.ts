import { expect, test } from "bun:test";
import type { ApiActivity, ApiOrder } from "@medialane/sdk";
import { formatActivity, formatOrderNotification } from "./format-activity.js";

const resolve = (uri: string | null | undefined) => (uri ? `resolved:${uri}` : null);

test("formatActivity resolves the token image with the given resolver", () => {
  const event = { type: "sale", chain: "STARKNET", nftContract: "0xc", nftTokenId: "1", txHash: null, timestamp: new Date().toISOString(), token: { name: "A", image: "ipfs://Qm1", animationUrl: null } } as unknown as ApiActivity;
  expect(formatActivity(event, resolve).image).toBe("resolved:ipfs://Qm1");
});

test("formatOrderNotification resolves the token image with the given resolver", () => {
  const order = { orderHash: "0x1", offerer: "0xabcdef123456", offer: { itemType: "ERC20" }, consideration: { itemType: "ERC721", token: "0xc", identifier: "2" }, token: { name: "A", image: "ipfs://Qm2" }, createdAt: new Date().toISOString() } as unknown as ApiOrder;
  expect(formatOrderNotification(order, resolve).image).toBe("resolved:ipfs://Qm2");
});
