import { describe, expect, test } from "bun:test";
import { isLivingRenderCollection, LIVING_RENDER_COLLECTIONS } from "./living-render-collections.js";

describe("isLivingRenderCollection", () => {
  test("empty allowlist (pre-mainnet-deploy state) matches nothing", () => {
    expect(isLivingRenderCollection("STARKNET", "0x1")).toBe(false);
  });

  test("returns true for a listed address, case/padding-insensitive", () => {

    const fixtureAddr = "0x00000000000000000000000000000000000000000000000000000000000abc";
    LIVING_RENDER_COLLECTIONS.STARKNET = [fixtureAddr];
    expect(isLivingRenderCollection("STARKNET", "0xABC")).toBe(true);
    expect(isLivingRenderCollection("STARKNET", fixtureAddr)).toBe(true);
    LIVING_RENDER_COLLECTIONS.STARKNET = [];
  });

  test("returns false for an unlisted chain", () => {
    expect(isLivingRenderCollection("ETHEREUM", "0x1")).toBe(false);
  });
});
