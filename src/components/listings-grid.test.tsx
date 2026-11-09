import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { ApiOrder } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { ListingsGrid } = await import("./listings-grid.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";

const order = (n: number, offerer: string, itemType = "ERC721") =>
  ({
    orderHash: `0x${n}`,
    offerer,
    status: "ACTIVE",
    nftContract: "0xc1",
    nftTokenId: String(n),
    offer: { itemType },
    consideration: { itemType: "ERC20" },
    price: { formatted: "1", currency: "STRK", decimals: 18, raw: "1" },
    token: { name: `Item ${n}`, image: null },
    createdAt: new Date().toISOString(),
  }) as unknown as ApiOrder;

function show(orders: ApiOrder[], walletAddress: string | null, onBuy: (o: ApiOrder) => void, orderType = "") {
  const client = { api: { orders: { list: async () => ({ data: orders, meta: { total: orders.length } }) } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress, onRequireWallet: () => {} } as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <ListingsGrid orderType={orderType} onBuy={onBuy} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
}

test("buying a listing hands it to the app", async () => {
  const bought: string[] = [];
  const view = show([order(1, OTHER)], ME, (o) => bought.push(o.orderHash));
  await waitFor(() => expect(view.getByText("Item 1")).toBeTruthy());
  fireEvent.click(view.getByRole("button", { name: /Buy/ }));
  expect(bought).toEqual(["0x1"]);
});

test("your own listing has no Buy button", async () => {
  const view = show([order(1, ME)], ME, () => {});
  await waitFor(() => expect(view.getByText("Item 1")).toBeTruthy());
  expect(view.queryByRole("button", { name: /Buy/ })).toBeNull();
});

test("shows 15 at a time out of what the backend sent", async () => {
  const many = Array.from({ length: 20 }, (_, i) => order(i + 1, OTHER));
  const view = show(many, ME, () => {});
  await waitFor(() => expect(view.getByText("Item 1")).toBeTruthy());
  expect(view.getAllByText(/^Item \d+$/).length).toBe(15);
});

test("an empty marketplace says so and offers to create", async () => {
  const view = show([], ME, () => {});
  await waitFor(() => expect(view.getByText(/Create & Sell/)).toBeTruthy());
});
