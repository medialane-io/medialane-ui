import { beforeEach, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { swapQuoteKey, useSwapQuote } from "./use-swap-quote.js";

const realSetTimeout = globalThis.setTimeout;
const bodies: unknown[] = [];

const client = {
  api: { platform: { swapQuote: async (body: unknown) => { bodies.push(body); return { sellAmount: "5" }; } } },
} as unknown as MedialaneClient;

const wrapperFor = (signedIn: boolean) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <MedialaneAppProvider value={{ getClient: () => client, signedIn } as unknown as MedialaneApp}>{children}</MedialaneAppProvider>
      </SWRConfig>
    );
  };

const settle = () => act(async () => { await new Promise((resolve) => realSetTimeout(resolve, 30)); });

beforeEach(() => {
  bodies.length = 0;
});

test("no quote key while signed out or while a part is missing", () => {
  expect(swapQuoteKey(false, "USDC", "STRK", "1", "sell", null)).toBeNull();
  expect(swapQuoteKey(true, null, "STRK", "1", "sell", null)).toBeNull();
  expect(swapQuoteKey(true, "USDC", "STRK", null, "sell", null)).toBeNull();
  expect(swapQuoteKey(true, "USDC", "STRK", "1", "sell", null)).not.toBeNull();
});

test("a quote is not requested while signed out", async () => {
  renderHook(() => useSwapQuote("USDC", "STRK", "7", null), { wrapper: wrapperFor(false) });
  await settle();
  expect(bodies).toEqual([]);
});

test("symbols quote a buy amount by default", async () => {
  const { result } = renderHook(() => useSwapQuote("USDC", "STRK", "7", "0xtaker"), { wrapper: wrapperFor(true) });
  await waitFor(() => expect(result.current.quote).not.toBeNull());
  expect(bodies).toEqual([{ sellSymbol: "USDC", buySymbol: "STRK", buyAmountRaw: "7", takerAddress: "0xtaker" }]);
});

test("token addresses quote a sell amount when asked", async () => {
  const { result } = renderHook(() => useSwapQuote({ address: "0xa" }, { address: "0xb" }, "9", null, "sell"), { wrapper: wrapperFor(true) });
  await waitFor(() => expect(result.current.quote).not.toBeNull());
  expect(bodies).toEqual([{ sellTokenAddress: "0xa", buyTokenAddress: "0xb", sellAmountRaw: "9", takerAddress: undefined }]);
});

test("the quote refreshes every 20 seconds while mounted", async () => {
  const delays: number[] = [];
  globalThis.setTimeout = ((fn: () => void, ms?: number, ...args: unknown[]) => {
    if (typeof ms === "number" && ms >= 16_000) delays.push(ms);
    return realSetTimeout(fn, ms, ...args);
  }) as unknown as typeof setTimeout;
  try {
    const { result } = renderHook(() => useSwapQuote("USDC", "STRK", "7", null), { wrapper: wrapperFor(true) });
    await waitFor(() => expect(result.current.quote).not.toBeNull());
    await settle();
    expect(delays).toEqual([20_000]);
  } finally {
    globalThis.setTimeout = realSetTimeout;
  }
});
