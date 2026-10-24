import type { Call } from "starknet";
import type { ApiIntentCreated } from "@medialane/sdk";

export async function runIntentCalls(
  signer: { execute(calls: Call[], opts?: { intentIds?: string[] }): Promise<{ txHash: string }> },
  create: () => Promise<ApiIntentCreated>,
): Promise<{ txHash: string }> {
  const intent = (await create()) as { id: string; calls: Call[] };
  return signer.execute(intent.calls, { intentIds: [intent.id] });
}

export async function runIntentsCalls(
  signer: { execute(calls: Call[], opts?: { intentIds?: string[] }): Promise<{ txHash: string }> },
  intents: ApiIntentCreated[],
): Promise<{ txHash: string }> {
  if (intents.some((i) => i.requiresSignature)) throw new Error("Expected prebuilt intents (requiresSignature=false)");
  const prebuilt = intents as { id: string; calls: Call[] }[];
  return signer.execute(prebuilt.flatMap((i) => i.calls), { intentIds: prebuilt.map((i) => i.id) });
}
