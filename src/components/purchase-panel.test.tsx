import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { getTokenBySymbol, type ApiOrder } from "@medialane/sdk";
import { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";
import { PurchasePanel, amountText, editionsAvailable, type PurchasePanelProps } from "./purchase-panel.js";

globalThis.fetch = (async () => new Response(JSON.stringify({ data: { usd: {} } }))) as unknown as typeof fetch;

let held: Record<string, bigint> = {};
const symbols = ["USDC", "USDT", "ETH", "STRK", "WBTC"];

const real = new MedialaneClient({ feeConfig: { enabled: true } });

const listing = (itemType = "ERC1155") =>
  ({
    nftTokenId: "1",
    remainingAmount: "1000",
    offer: { itemType, token: "0x1", identifier: "1", startAmount: "1000", endAmount: "1000" },
    consideration: { itemType: "ERC20", token: getTokenBySymbol("USDC")!.address, identifier: "0", startAmount: "10000", endAmount: "10000", recipient: "0x3" },
    price: { formatted: "0.01", currency: "USDC", decimals: 6, raw: "10000" },
    token: { name: "Himalayas Records" },
  }) as unknown as ApiOrder;

const client = {
  purchaseCost: real.purchaseCost.bind(real),
  provider: {
    callContract: async ({ contractAddress }: { contractAddress: string }) => {
      const symbol = symbols.find((s) => BigInt(getTokenBySymbol(s)!.address) === BigInt(contractAddress))!;
      return ["0x" + (held[symbol] ?? 0n).toString(16), "0x0"];
    },
  },
  api: { platform: { swapQuote: async () => ({ sellAmount: "312600000000000000" }) } },
} as unknown as MedialaneClient;

type HarnessProps = Partial<PurchasePanelProps> & { onPick?: (symbol: string | null) => void };

function Harness({ onPick, ...props }: HarnessProps) {
  const [quantity, setQuantity] = useState(1);
  const [payWith, setPayWith] = useState<string | null>(null);
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={{ getClient: () => client, signedIn: true } as unknown as MedialaneApp}>
        <PurchasePanel
          order={listing("ERC721")}
          quantity={quantity}
          onQuantityChange={setQuantity}
          walletAddress="0xabc"
          payWith={payWith}
          onPayWithChange={(symbol) => { setPayWith(symbol); onPick?.(symbol); }}
          {...props}
        >
          <button type="button">Buy now</button>
        </PurchasePanel>
        <output data-testid="quantity">{quantity}</output>
      </MedialaneAppProvider>
    </SWRConfig>
  );
}

beforeEach(() => {
  held = {};
});
afterEach(() => cleanup());

describe("PurchasePanel", () => {
  test("when the order's coin doesn't cover it, the first coin that does is picked and priced in the total", async () => {
    held = { STRK: 3_030_000_000_000_000_000n };
    const picks: (string | null)[] = [];
    render(<Harness onPick={(s) => picks.push(s)} />);
    await waitFor(() => expect(picks).toContain("STRK"));
    expect(screen.getByRole("radio", { name: /STRK/ }).getAttribute("aria-checked")).toBe("true");
    expect((screen.getByRole("radio", { name: /USDC/ }) as HTMLButtonElement).disabled).toBe(true);
    await waitFor(() => expect(screen.getByText("0.3126")).toBeTruthy());
    expect(screen.getByText("Includes 1% platform fee")).toBeTruthy();
  });

  test("the order's coin is kept when it covers the purchase", async () => {
    held = { USDC: 1_000_000n };
    const picks: (string | null)[] = [];
    render(<Harness onPick={(s) => picks.push(s)} />);
    await waitFor(() => expect(picks).toEqual(["USDC"]));
    expect(screen.getByText("0.0101")).toBeTruthy();
  });

  test("an error shows right above the action", () => {
    render(<Harness walletAddress={null} error="Nothing was sent. Check your balance and try again." />);
    const alert = screen.getByText("Nothing was sent. Check your balance and try again.").closest("[role=alert]")!;
    expect(alert.nextElementSibling?.textContent).toBe("Buy now");
  });

  test("a typed quantity is kept within what is available", () => {
    render(<Harness walletAddress={null} order={listing("ERC1155")} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });
    fireEvent.change(input, { target: { value: "5000" } });
    fireEvent.blur(input);
    expect(screen.getByTestId("quantity").textContent).toBe("1000");
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    expect(screen.getByTestId("quantity").textContent).toBe("999");
    expect(screen.getByText("1,000 available")).toBeTruthy();
  });

  test("without a wallet no coins are listed and the total is in the order's coin", () => {
    render(<Harness walletAddress={null} />);
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.getByText("0.0101")).toBeTruthy();
  });

  test("when no coin covers it, adding funds is offered", async () => {
    let asked = 0;
    render(<Harness onAddFunds={() => { asked++; }} />);
    fireEvent.click(await screen.findByRole("button", { name: "Add funds" }));
    expect(asked).toBe(1);
  });
});

describe("editionsAvailable", () => {
  test("is what is left of an ERC-1155 listing, and nothing for ERC-721", () => {
    expect(editionsAvailable(listing("ERC1155"))).toBe(1000);
    expect(editionsAvailable(listing("ERC721"))).toBeNull();
  });

  test("an ERC-721 purchase has no quantity field", () => {
    render(<Harness walletAddress={null} />);
    expect(screen.queryByRole("textbox", { name: "Quantity" })).toBeNull();
  });
});

describe("amountText", () => {
  test("shows four decimals, or four significant digits below one", () => {
    expect(amountText(3_030_000_000_000_000_000n, 18)).toBe("3.03");
    expect(amountText(10_100n, 6)).toBe("0.0101");
    expect(amountText(12n, 8)).toBe("0.00000012");
    expect(amountText(0n, 18)).toBe("0");
  });
});
