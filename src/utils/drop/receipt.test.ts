import { expect, test } from "bun:test";
import { hash } from "starknet";
import { claimedTokenIds } from "./receipt.js";

const sel = hash.getSelectorFromName("Claimed");

test("reads the minted token ids from the drop's Claimed event", () => {
  const receipt = { events: [
    { from_address: "0xabc", keys: [sel, "0x1"], data: ["0x9", "0x0", "0x1", "0x0", "0x0", "0x0"] },
    { from_address: "0x0d409", keys: [sel, "0x2"], data: ["0x3", "0x0", "0xb", "0x0", "0x0", "0x0"] },
  ] };
  expect(claimedTokenIds(receipt, "0xd409")).toEqual(["11", "12", "13"]);
  expect(claimedTokenIds({ events: [] }, "0xd409")).toEqual([]);
});
