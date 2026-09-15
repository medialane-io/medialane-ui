import { syncTransaction } from "../../utils/sync-transaction.js";

export async function executeAndSync(
  execute: () => Promise<{ txHash: string }>,
  sync: (txHash: string) => Promise<unknown> = syncTransaction,
): Promise<{ txHash: string }> {
  const result = await execute();
  await sync(result.txHash);
  return result;
}
