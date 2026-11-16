import { describe, expect, test } from "bun:test";
import type { ApiClient } from "@medialane/sdk";
import { claimEndTimestamp, dateToUnixTimestamp, popEventAttributes, popEventIntent, serviceCollectionIntent, tierIntents, tierTraits } from "./launchpad-actions";

function recorder() {
  const calls: Array<{ kind: string; params: Record<string, unknown> }> = [];
  const api = {
    intents: {
      create: async (kind: string, params: Record<string, unknown>) => {
        calls.push({ kind, params });
        return { id: `${kind}-${calls.length}`, requiresSignature: false, calls: [] };
      },
    },
  } as unknown as ApiClient;
  return { api, calls };
}

describe("the intents behind each launchpad service", () => {
  test("a POP event is a collection of the POP service with a claim deadline", async () => {
    const { api, calls } = recorder();
    await popEventIntent(api, { owner: "0xa", name: "Rio Summit", symbol: "RIO", baseUri: "ipfs://m", claimEndTimestamp: 123 });
    expect(calls).toEqual([{ kind: "create-collection", params: { owner: "0xa", name: "Rio Summit", symbol: "RIO", baseUri: "ipfs://m", claimEndTimestamp: 123, service: "pop-protocol" } }]);
  });

  test("a ticket or club collection carries its service, and a plain collection carries none", async () => {
    const { api, calls } = recorder();
    await serviceCollectionIntent(api, { owner: "0xa", name: "T", symbol: "TIX", baseUri: "ipfs://m", service: "ip-tickets" });
    await serviceCollectionIntent(api, { owner: "0xa", name: "T", symbol: "TIX", baseUri: "ipfs://m" });
    expect(calls[0]!.params.service).toBe("ip-tickets");
    expect("service" in calls[1]!.params).toBe(false);
  });

  test("a ticket type is created and its supply minted to the owner in one pair of intents", async () => {
    const { api, calls } = recorder();
    const intents = await tierIntents(api, { owner: "0xa", contract: "0xc", service: "ip-tickets", tierId: 3, maxSupply: "100", startTime: 10, endTime: 20, royaltyBps: 250, metadataUri: "ipfs://t" });
    expect(intents).toHaveLength(2);
    expect(calls.map((c) => c.kind)).toEqual(["create-tier", "mint"]);
    expect(calls[0]!.params).toMatchObject({ owner: "0xa", collection: "0xc", service: "ip-tickets", maxSupply: "100", startTime: 10, endTime: 20, royaltyBps: 250, metadataUri: "ipfs://t" });
    expect(calls[1]!.params).toMatchObject({ owner: "0xa", recipient: "0xa", collectionContract: "0xc", tokenId: "3", amount: "100" });
  });
});

describe("the small rules shared by the forms", () => {
  test("a claim deadline is a unix timestamp in seconds", () => {
    expect(claimEndTimestamp("2030-01-01", "00:00")).toBe(Math.floor(new Date("2030-01-01T00:00:00").getTime() / 1000));
  });

  test("a blank or invalid date is no timestamp", () => {
    expect(dateToUnixTimestamp(undefined)).toBeUndefined();
    expect(dateToUnixTimestamp("")).toBeUndefined();
    expect(dateToUnixTimestamp("nope")).toBeUndefined();
    expect(dateToUnixTimestamp("2030-01-01")).toBe(Math.floor(new Date("2030-01-01").getTime() / 1000));
  });

  test("POP attributes record visibility and event type", () => {
    expect(popEventAttributes("Conference", true)).toEqual([{ trait_type: "Visibility", value: "Public" }, { trait_type: "Event Type", value: "Conference" }]);
    expect(popEventAttributes("Other", false)[0]!.value).toBe("Private");
  });

  test("a tier's traits name its type, supply and collection", () => {
    expect(tierTraits("IP Ticket", "50", "0xc")).toEqual([
      { traitType: "Type", value: "IP Ticket" },
      { traitType: "Token Standard", value: "ERC-1155" },
      { traitType: "Max Supply", value: "50" },
      { traitType: "Collection Contract", value: "0xc" },
    ]);
  });
});
