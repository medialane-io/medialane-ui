import { beforeEach, describe, expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { getTokenBySymbol } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { pickPayment, usePaymentOptions, type PaymentOption } from "./use-payment-options.js";

const address = (symbol: string) => getTokenBySymbol(symbol)!.address;

let held: Record<string, bigint> = {};
let reads = 0;
const quoted: unknown[] = [];

const client = {
  provider: {
    callContract: async ({ contractAddress }: { contractAddress: string }) => {
      reads++;
      const symbol = ["USDC", "USDT", "ETH", "STRK", "WBTC"].find((s) => BigInt(address(s)) === BigInt(contractAddress))!;
      return ["0x" + (held[symbol] ?? 0n).toString(16), "0x0"];
    },
  },
  api: {
    platform: {
      swapQuote: async (body: { sellSymbol: string }) => {
        quoted.push(body);
        return { sellAmount: body.sellSymbol === "STRK" ? "300" : "9999" };
      },
    },
  },
} as unknown as MedialaneClient;

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={{ getClient: () => client, signedIn: true } as unknown as MedialaneApp}>{children}</MedialaneAppProvider>
    </SWRConfig>
  );
}

beforeEach(() => {
  held = {};
  reads = 0;
  quoted.length = 0;
});

describe("usePaymentOptions", () => {
  test("lists the order's coin first, then the other coins the wallet holds, priced by a quote", async () => {
    held = { USDC: 50n, STRK: 1000n, ETH: 5n };
    const { result } = renderHook(
      () => usePaymentOptions({ currency: "USDC", amountRaw: 101n, walletAddress: "0xabc" }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.options.find((o) => o.symbol === "STRK")?.cost).toBe(300n));
    const bySymbol = Object.fromEntries(result.current.options.map((o) => [o.symbol, o]));
    expect(result.current.options.map((o) => o.symbol)).toEqual(["USDC", "ETH", "STRK"]);
    expect(bySymbol.USDC).toMatchObject({ balance: 50n, cost: 101n, covers: false });
    expect(bySymbol.STRK).toMatchObject({ balance: 1000n, cost: 300n, covers: true });
    expect(bySymbol.ETH).toMatchObject({ balance: 5n, cost: 9999n, covers: false });
    expect(quoted).toContainEqual({ sellSymbol: "STRK", buySymbol: "USDC", buyAmountRaw: "101", takerAddress: "0xabc" });
  });

  test("coins the wallet doesn't hold are not quoted", async () => {
    held = { USDC: 500n };
    const { result } = renderHook(
      () => usePaymentOptions({ currency: "USDC", amountRaw: 101n, walletAddress: "0xabc" }),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.options).toEqual([{ symbol: "USDC", decimals: 6, balance: 500n, cost: 101n, covers: true }]);
    expect(quoted).toEqual([]);
  });

  test("nothing is read without a wallet", () => {
    const { result } = renderHook(
      () => usePaymentOptions({ currency: "USDC", amountRaw: 101n, walletAddress: null }),
      { wrapper: Wrapper },
    );
    expect(result.current.isLoading).toBe(false);
    expect(reads).toBe(0);
  });
});

describe("pickPayment", () => {
  const option = (symbol: string, covers: boolean): PaymentOption => ({ symbol, decimals: 18, balance: 1n, cost: 1n, covers });

  test("keeps the current coin while it covers the purchase", () => {
    expect(pickPayment([option("USDC", true), option("STRK", true)], "STRK")).toBe("STRK");
  });

  test("otherwise picks the first coin that covers it", () => {
    expect(pickPayment([option("USDC", false), option("STRK", true)], null)).toBe("STRK");
    expect(pickPayment([option("USDC", false), option("STRK", true)], "USDC")).toBe("STRK");
  });

  test("picks nothing when no coin covers it", () => {
    expect(pickPayment([option("USDC", false)], "USDC")).toBeNull();
  });
});
