import type { CreateDropManageIntentParams, DropTermsBody } from "@medialane/sdk";
import { deployedCollectionFromReceipt, executeIntent, type MedialaneClient } from "@medialane/sdk/starknet";
import { claimedTokenIds } from "./receipt.js";
import type { DropSigner } from "./types.js";

export interface DropDeps {
  client: MedialaneClient;
  signer: DropSigner;
}

export async function launchDrop(
  deps: DropDeps,
  input: {
    owner: string; name: string; symbol: string; baseUri: string; maxSupply: number;
    terms: DropTermsBody; allowlistRoot?: string; description?: string; image?: string;
  },
): Promise<{ collection: string; txHash: string }> {
  const res = await deps.client.api.intents.create("create-collection", {
    owner: input.owner,
    name: input.name,
    symbol: input.symbol,
    baseUri: input.baseUri,
    service: "drop-collection",
    maxSupply: String(input.maxSupply),
    terms: input.terms,
    ...(input.allowlistRoot ? { allowlistRoot: input.allowlistRoot } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: input.image } : {}),
  });
  const { txHash, receipt } = await executeIntent(deps.signer, deps.client, res);
  const collection = deployedCollectionFromReceipt(receipt, "drop-collection");
  if (!collection) throw new Error("Your drop launched, but its address wasn't found yet. Check My drops in a minute.");
  return { collection, txHash };
}

export async function mintDrop(
  deps: DropDeps,
  input: { claimer: string; collection: string; quantity: bigint; proof: string[] | null },
): Promise<{ txHash: string; tokenIds: string[] }> {
  const res = await deps.client.api.intents.create("drop-claim", {
    claimer: input.claimer,
    collection: input.collection,
    quantity: input.quantity.toString(),
    ...(input.proof ? { proof: input.proof } : {}),
  });
  const { txHash, receipt } = await executeIntent(deps.signer, deps.client, res);
  return { txHash, tokenIds: claimedTokenIds(receipt, input.collection) };
}

export async function manageDrop(deps: DropDeps, params: CreateDropManageIntentParams): Promise<{ txHash: string }> {
  const res = await deps.client.api.intents.create("drop-manage", params);
  const { txHash } = await executeIntent(deps.signer, deps.client, res);
  return { txHash };
}

export interface ExclusiveContent {
  title: string;
  url: string;
  type: string;
}

export async function saveExclusiveContent(client: MedialaneClient, collection: string, content: ExclusiveContent | null): Promise<void> {
  await client.api.collections.updateProfile(collection, {
    gatedContentTitle: content?.title || null,
    gatedContentUrl: content?.url || null,
    gatedContentType: (content?.type || null) as never,
  });
}
