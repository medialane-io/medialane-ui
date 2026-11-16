import type { ApiClient, ApiIntentCreated } from "@medialane/sdk";

export function claimEndTimestamp(date: string, time: string): number {
  return Math.floor(new Date(`${date}T${time}:00`).getTime() / 1000);
}

export function dateToUnixTimestamp(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return Math.floor(d.getTime() / 1000);
}

export function popEventAttributes(eventType: string, isPublic: boolean) {
  return [
    { trait_type: "Visibility", value: isPublic ? "Public" : "Private" },
    { trait_type: "Event Type", value: eventType },
  ];
}

export function popEventIntent(
  api: ApiClient,
  p: { owner: string; name: string; symbol: string; baseUri: string; claimEndTimestamp: number },
): Promise<ApiIntentCreated> {
  return api.intents.create("create-collection", { ...p, service: "pop-protocol" });
}

export function serviceCollectionIntent(
  api: ApiClient,
  p: { owner: string; name: string; symbol: string; baseUri: string; service?: "ip-club" | "ip-tickets" | "mip-erc1155" },
): Promise<ApiIntentCreated> {
  const { service, ...rest } = p;
  return api.intents.create("create-collection", { ...rest, ...(service ? { service } : {}) });
}

export function tierTraits(traitType: string, maxSupply: string, contract: string) {
  return [
    { traitType: "Type", value: traitType },
    { traitType: "Token Standard", value: "ERC-1155" },
    { traitType: "Max Supply", value: maxSupply },
    { traitType: "Collection Contract", value: contract },
  ];
}

export async function tierIntents(
  api: ApiClient,
  p: {
    owner: string;
    contract: string;
    service: "ip-club" | "ip-tickets";
    tierId: number;
    maxSupply: string;
    startTime?: number;
    endTime?: number;
    royaltyBps: number;
    metadataUri: string;
  },
): Promise<ApiIntentCreated[]> {
  const tier = await api.intents.create("create-tier", {
    owner: p.owner,
    collection: p.contract,
    service: p.service,
    maxSupply: p.maxSupply,
    startTime: p.startTime,
    endTime: p.endTime,
    royaltyBps: p.royaltyBps,
    metadataUri: p.metadataUri,
  });
  const mint = await api.intents.create("mint", {
    owner: p.owner,
    recipient: p.owner,
    collectionContract: p.contract,
    tokenId: String(p.tierId),
    amount: p.maxSupply,
  });
  return [tier, mint];
}
