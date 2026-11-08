import type { Call } from "starknet";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { runIntentCalls } from "./run-intent-calls.js";

export function sendToken(
  signer: { address: string; execute(calls: Call[], opts?: { intentIds?: string[] }): Promise<{ txHash: string }> },
  client: Pick<MedialaneClient, "createIntent">,
  input: { token: string; recipient: string; amount: bigint },
): Promise<{ txHash: string }> {
  return runIntentCalls(signer, () =>
    client.createIntent("transfer-token", {
      owner: signer.address,
      token: input.token,
      recipient: input.recipient,
      amount: input.amount.toString(),
    }),
  );
}
