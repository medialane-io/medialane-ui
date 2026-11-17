import { describe, expect, test } from "bun:test";
import { COLLECTION_NAME_CLAIM, LAUNCHPAD_SERVICE_DEFINITIONS, LAUNCHPAD_SERVICE_GROUPS, getMintFormatCopy } from "./launchpad-services";

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
    expect(["claim-username", "claim-collection"].map(groupOf)).toEqual(Array(2).fill("claims"));
  });

  test("every service belongs to a listed section", () => {
    const keys = new Set(LAUNCHPAD_SERVICE_GROUPS.map((g) => g.key));
    for (const d of LAUNCHPAD_SERVICE_DEFINITIONS) expect(keys.has(d.group)).toBe(true);
  });

  test("the collection name claim is not a launchpad service", () => {
    expect(LAUNCHPAD_SERVICE_DEFINITIONS.some((d) => d.key === COLLECTION_NAME_CLAIM.key)).toBe(false);
    expect(COLLECTION_NAME_CLAIM.group).toBe("claims");
  });

  test("each service Fast Mint can make carries the name and hint the picker shows", () => {
    const names = ["nfts", "limited-editions", "pop-protocol", "ip-tickets", "ip-club"].map((key) => getMintFormatCopy(key).name);
    expect(names).toEqual(["Single NFT", "Limited Editions", "Immutable certificate", "IP Ticket", "IP Club"]);
    expect(() => getMintFormatCopy("claim-username")).toThrow();
  });
});

describe("the wording of the service cards", () => {
  const second = /\b(you|your|yours|you're|you'll|you've|yourself)\b/i;
  const withoutAddresses = (text: string) => text.replace(/medialane\.io\/\S+/g, "");

  test("never addresses the reader and never uses the word badge", () => {
    for (const d of [...LAUNCHPAD_SERVICE_DEFINITIONS, COLLECTION_NAME_CLAIM]) {
      const copy = [d.blurb, d.subtitle, d.description, d.example ?? "", ...d.features, d.format?.name ?? "", d.format?.hint ?? ""].map(withoutAddresses);
      for (const text of copy) {
        expect(second.test(text), `${d.key}: ${text}`).toBe(false);
        expect(/badge/i.test(text), `${d.key}: ${text}`).toBe(false);
      }
    }
  });
});
