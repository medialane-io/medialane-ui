import { describe, expect, test } from "bun:test";
import { COLLECTION_NAME_CLAIM, LAUNCHPAD_SERVICE_DEFINITIONS, LAUNCHPAD_SERVICE_GROUPS, getMintFormatCopy } from "./launchpad-services";

const groupOf = (key: string) => LAUNCHPAD_SERVICE_DEFINITIONS.find((d) => d.key === key)?.group;

describe("the launchpad sections", () => {
  test("appear in this order", () => {
    expect(LAUNCHPAD_SERVICE_GROUPS.map((g) => g.title)).toEqual([
      "NFTs",
      "Collections",
      "Coins",
      "Membership",
      "Licensing",
      "Claims",
      "Coming soon",
    ]);
  });

  test("each service sits in the section it belongs to", () => {
    expect(["nfts", "limited-editions", "remix-asset"].map(groupOf)).toEqual(Array(3).fill("nfts"));
    expect(["create-collection", "create-1155", "collection-drop"].map(groupOf)).toEqual(Array(3).fill("collections"));
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
    expect(names).toEqual(["Single NFT", "Limited Edition NFT", "Permanent certificate", "IP Ticket", "IP Club"]);
    expect(() => getMintFormatCopy("claim-username")).toThrow();
  });
});

describe("the service names", () => {
  const nameOf = (key: string) => [...LAUNCHPAD_SERVICE_DEFINITIONS, COLLECTION_NAME_CLAIM].find((d) => d.key === key)?.title;

  test("say what each service gives", () => {
    expect([
      "nfts", "limited-editions", "remix-asset",
      "create-collection", "create-1155", "collection-drop",
      "creator-coins", "claim-memecoin",
      "pop-protocol", "ip-tickets", "ip-club", "ip-sponsorship",
      "claim-username", "claim-collection", "claim-collection-name",
    ].map(nameOf)).toEqual([
      "Single NFT", "Limited Edition NFT", "NFT Remix",
      "NFT Collection", "Limited Edition NFT Collection", "NFT Drop",
      "Creator Coin", "Existing Memecoin",
      "POP Protocol", "IP Tickets", "IP Club", "IP Sponsorship",
      "Username", "Existing Collection", "Collection Address",
    ]);
  });

  test("no two cards share a description", () => {
    const blurbs = LAUNCHPAD_SERVICE_DEFINITIONS.map((d) => d.blurb);
    expect(new Set(blurbs).size).toBe(blurbs.length);
  });

  test("card text never calls an asset a work and never uses the word badge", () => {
    for (const d of [...LAUNCHPAD_SERVICE_DEFINITIONS, COLLECTION_NAME_CLAIM]) {
      for (const text of [d.title, d.blurb, d.example ?? "", d.format?.name ?? "", d.format?.hint ?? ""]) {
        expect(/\bworks?\b|badge/i.test(text), `${d.key}: ${text}`).toBe(false);
      }
    }
  });
});
