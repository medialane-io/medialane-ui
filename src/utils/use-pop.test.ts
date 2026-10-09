import { test, expect } from "bun:test";
import { popClaimedKey } from "./use-pop.js";

test("reads claim status only once both the collection and the wallet are known", () => {
  expect(popClaimedKey(null, "0x1")).toBeNull();
  expect(popClaimedKey("0xabc", null)).toBeNull();
  expect(popClaimedKey("0xabc", "0x1")).toBe("pop-claimed-0xabc-0x1");
});
