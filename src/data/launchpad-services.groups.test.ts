import { describe, expect, test } from "bun:test";
import { LAUNCHPAD_SERVICE_DEFINITIONS, LAUNCHPAD_SERVICE_GROUPS } from "./launchpad-services";

const def = (key: string) => LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === key);

describe("which section each claim sits in", () => {
  test("every claim card, including the memecoin claim, is in the Claims group", () => {
    for (const key of ["claim-username", "claim-collection", "claim-collection-name", "claim-memecoin"]) {
      expect(def(key)?.group).toBe("claims");
    }
  });

  test("the Coins section only talks about launching a coin, since claiming one lives under Claims", () => {
    const coins = LAUNCHPAD_SERVICE_GROUPS.find((g) => g.key === "coins");
    expect(coins?.tagline).toBe("Launch your own coin.");
  });

  test("the Claims section's tagline covers bringing in a coin as well", () => {
    const claims = LAUNCHPAD_SERVICE_GROUPS.find((g) => g.key === "claims");
    expect(claims?.tagline.toLowerCase()).toContain("coin");
  });
});
