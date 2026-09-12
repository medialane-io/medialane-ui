"use client";

const SYNC_PATH = "/api/proxy/v1/tx/sync";
const DEFAULT_TIMEOUT_MS = 6000;

export interface SyncTransactionResult {
  applied: number;
  contracts: string[];
  pending: boolean;
}

export async function syncTransaction(
  txHash: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<SyncTransactionResult | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, timeoutMs);
  });

  const request = (async (): Promise<SyncTransactionResult | null> => {
    try {
      const res = await fetch(SYNC_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash }),
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const body = (await res.json().catch(() => null)) as { data?: SyncTransactionResult } | null;
      return body?.data ?? null;
    } catch {
      return null;
    }
  })();

  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
