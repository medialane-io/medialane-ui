import { describe, expect, test } from "bun:test";
import { LAUNCHPAD_SERVICE_DEFINITIONS, LAUNCHPAD_SERVICE_GROUPS } from "./launchpad-services";

const groupOf = (key: string) => LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === key)?.group;

describe("the launchpad sections", () => {
  test("appear in this order", () => {
    expect(LAUNCHPAD_SERVICE_GROUPS.map((g) => g.title)).toEqual([
      "Single NFTs",
      "Limited Editions",
      "Coins",
      "Membership",
      "Licensing",
      "Claims",
      "Coming soon",
    ]);
  });

  test("each service sits in the section it belongs to", () => {
    expect(["nfts", "create-collection", "collection-drop", "remix-asset"].map(groupOf)).toEqual(Array(4).fill("single-nfts"));
    expect(["limited-editions", "create-1155"].map(groupOf)).toEqual(Array(2).fill("limited-editions"));
    expect(["creator-coins", "claim-memecoin"].map(groupOf)).toEqual(Array(2).fill("coins"));
    expect(["pop-protocol", "ip-tickets", "ip-club"].map(groupOf)).toEqual(Array(3).fill("membership"));
    expect(groupOf("ip-sponsorship")).toBe("licensing");
    expect(["claim-username", "claim-collection", "claim-collection-name"].map(groupOf)).toEqual(Array(3).fill("claims"));
  });

  test("every service belongs to a listed section", () => {
    const keys = new Set(LAUNCHPAD_SERVICE_GROUPS.map((g) => g.key));
    for (const d of LAUNCHPAD_SERVICE_DEFINITIONS) expect(keys.has(d.group)).toBe(true);
  });
});
