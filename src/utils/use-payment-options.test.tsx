import { beforeEach, describe, expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { getListableTokens, getTokenBySymbol, type ApiOrder } from "@medialane/sdk";
import { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../components/medialane-app.js";
import { PAYMENT_COINS, pickPayment, usePaymentOptions, type PaymentOption } from "./use-payment-options.js";

let held: Record<string, bigint> = {};
let reads = 0;
const quoted: unknown[] = [];
const real = new MedialaneClient({ feeConfig: { enabled: true } });

const client = {
  purchaseCost: real.purchaseCost.bind(real),
  provider: {
    callContract: async ({ contractAddress }: { contractAddress: string }) => {
      reads++;
      const symbol = PAYMENT_COINS.find((s) => BigInt(getTokenBySymbol(s)!.address) === BigInt(contractAddress))!;
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

const usdcListing = (startAmount = "100", itemType = "ERC1155") =>
  ({
    nftTokenId: "1",
    remainingAmount: "1000",
    offer: { itemType, token: "0x1", identifier: "1", startAmount: "1000", endAmount: "1000" },
    consideration: { itemType: "ERC20", token: getTokenBySymbol("USDC")!.address, identifier: "0", startAmount, endAmount: startAmount, recipient: "0x3" },
    price: { formatted: "0.0001", currency: "USDC", decimals: 6, raw: startAmount },
    token: { name: "Himalayas Records" },
  }) as unknown as ApiOrder;

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
  test("the payment coins are the listable tokens", () => {
    expect([...PAYMENT_COINS].sort()).toEqual(getListableTokens().map((t) => t.symbol).sort());
  });

  test("the cost is the client's, fee included, for the quantity", () => {
    const { result } = renderHook(() => usePaymentOptions({ order: usdcListing(), quantity: 2, walletAddress: null }), { wrapper: Wrapper });
    expect(result.current.cost).toEqual({ gross: 200n, fee: 2n, total: 202n, feeBps: 100 });
  });

  test("lists the order's coin first, then the other coins the wallet holds, priced by a quote", async () => {
    held = { USDC: 50n, STRK: 1000n, ETH: 5n };
    const { result } = renderHook(() => usePaymentOptions({ order: usdcListing(), quantity: 1, walletAddress: "0xabc" }), { wrapper: Wrapper });
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
    const { result } = renderHook(() => usePaymentOptions({ order: usdcListing(), quantity: 1, walletAddress: "0xabc" }), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.options[0]?.balance).toBe(500n));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.options).toEqual([{ symbol: "USDC", decimals: 6, balance: 500n, cost: 101n, covers: true }]);
    expect(quoted).toEqual([]);
  });

  test("nothing is read without a wallet", () => {
    const { result } = renderHook(() => usePaymentOptions({ order: usdcListing(), quantity: 1, walletAddress: null }), { wrapper: Wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.options.every((o) => !o.covers)).toBe(true);
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
