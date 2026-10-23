import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import type { ApiOrder } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";
import { SWRConfig } from "swr";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { PortfolioOrders } = await import("./portfolio-orders.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => { cleanup(); localStorage.clear(); });

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const future = String(Math.floor(Date.now() / 1000) + 3 * 86400);
const past = String(Math.floor(Date.now() / 1000) - 60);

function order(o: Partial<ApiOrder> & { orderHash: string }): ApiOrder {
  return {
    offerer: ME, status: "ACTIVE", endTime: future, nftContract: "0xc1", nftTokenId: "7",
    offer: { itemType: "ERC721" }, consideration: { itemType: "ERC20" },
    price: { formatted: "10", currency: "STRK" }, token: { name: `Token ${o.orderHash}`, image: null },
    txHash: { created: "0xtx" },
    ...o,
  } as unknown as ApiOrder;
}

function renderView(view: "listings" | "offers" | "received" | "counter-offers", api: Record<string, unknown>, actions: Record<string, unknown> = {}) {
  const client = { api } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {} } as MedialaneApp;
  const calls: unknown[][] = [];
  const useActions = (ctx: unknown) => {
    calls.push(["ctx", ctx]);
    return {
      isProcessing: false,
      cancel: (o: ApiOrder) => calls.push(["cancel", o.orderHash]),
      accept: (o: ApiOrder, original?: ApiOrder) => calls.push(["accept", o.orderHash, original?.orderHash]),
      counter: (o: ApiOrder) => calls.push(["counter", o.orderHash]),
      dialogs: <div>app dialogs</div>,
      ...actions,
    };
  };
  const view$ = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><PortfolioOrders view={view} address={ME} useActions={useActions} /></MedialaneAppProvider></SWRConfig>);
  return { view: view$, calls };
}

test("listings show edition and unique listings and cancel through the app", async () => {
  const getOrdersByUser = async () => ({ data: [
    order({ orderHash: "l1", offer: { itemType: "ERC721" } as ApiOrder["offer"] }),
    order({ orderHash: "l2", offer: { itemType: "ERC1155" } as ApiOrder["offer"] }),
    order({ orderHash: "o1", offer: { itemType: "ERC20" } as ApiOrder["offer"] }),
    order({ orderHash: "l3", status: "FULFILLED" as ApiOrder["status"] }),
  ] });
  const { view, calls } = renderView("listings", { orders: { byUser: getOrdersByUser } });
  await waitFor(() => expect(view.getByText("Token l2")).toBeTruthy());
  expect(view.getByText("Token l1")).toBeTruthy();
  expect(view.queryByText("Token o1")).toBeNull();
  expect(view.queryByText("Token l3")).toBeNull();
  expect(view.getByText(/2 active listings/)).toBeTruthy();
  expect(view.getByText("app dialogs")).toBeTruthy();
  fireEvent.click(view.getAllByText("Cancel")[1]!);
  expect(calls.filter((c) => c[0] === "cancel")).toEqual([["cancel", "l2"]]);
  expect(calls[0]).toEqual(["ctx", expect.objectContaining({ view: "listings", refresh: expect.any(Function) })]);
});

test("offers show only token offers", async () => {
  const getOrdersByUser = async () => ({ data: [
    order({ orderHash: "l1" }),
    order({ orderHash: "o1", offer: { itemType: "ERC20" } as ApiOrder["offer"] }),
  ] });
  const { view } = renderView("offers", { orders: { byUser: getOrdersByUser } });
  await waitFor(() => expect(view.getByText("Token o1")).toBeTruthy());
  expect(view.queryByText("Token l1")).toBeNull();
});

test("received offers come from offers on owned tokens, link the sender's profile and mark new ones", async () => {
  localStorage.setItem("medialane-seen-offers", JSON.stringify(["r1"]));
  const getReceivedOffers = async () => ({ data: [
    order({ orderHash: "r1", offerer: OTHER, offer: { itemType: "ERC20" } as ApiOrder["offer"] }),
    order({ orderHash: "r2", offerer: OTHER, offer: { itemType: "ERC20" } as ApiOrder["offer"] }),
  ] });
  const { view, calls } = renderView("received", { orders: { receivedBy: getReceivedOffers } });
  await waitFor(() => expect(view.getByText("Token r2")).toBeTruthy());
  const senderLinks = Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href")).filter((h) => h?.startsWith("/account/"));
  expect(senderLinks).toEqual([`/account/${OTHER}`, `/account/${OTHER}`]);
  expect(view.container.querySelectorAll('[data-new="true"]').length).toBe(1);
  fireEvent.click(view.getAllByText("Accept")[1]!);
  fireEvent.click(view.getAllByText("Counter")[0]!);
  expect(calls.filter((c) => c[0] !== "ctx")).toEqual([["accept", "r2", undefined], ["counter", "r1"]]);
});

test("counter-offers show the seller's price against the bid and accept the counter", async () => {
  const bid = order({ orderHash: "b1", offer: { itemType: "ERC20" } as ApiOrder["offer"], hasActiveCounterOffer: true, price: { formatted: "5", currency: "STRK" } } as Partial<ApiOrder> & { orderHash: string });
  const expiredBid = order({ orderHash: "b2", offer: { itemType: "ERC20" } as ApiOrder["offer"], hasActiveCounterOffer: true } as Partial<ApiOrder> & { orderHash: string });
  const getOrdersByUser = async () => ({ data: [bid, expiredBid, order({ orderHash: "b3", offer: { itemType: "ERC20" } as ApiOrder["offer"] })] });
  const getCounterOffers = async ({ originalOrderHash }: { originalOrderHash: string }) => ({
    data: originalOrderHash === "b1"
      ? [order({ orderHash: "c1", offerer: OTHER, price: { formatted: "8", currency: "STRK" } as ApiOrder["price"] })]
      : [order({ orderHash: "c2", offerer: OTHER, endTime: past })],
  });
  const { view, calls } = renderView("counter-offers", { orders: { byUser: getOrdersByUser, counterOffers: getCounterOffers } });
  await waitFor(() => expect(view.getByText("Token c1")).toBeTruthy());
  await waitFor(() => expect(view.getByText("Token c2")).toBeTruthy());
  expect(view.getByText("8.00 STRK")).toBeTruthy();
  expect(view.getByText("5.00 STRK")).toBeTruthy();
  const accepts = view.getAllByRole("button").filter((b) => b.textContent === "Accept");
  expect(accepts.length).toBe(1);
  fireEvent.click(accepts[0]!);
  expect(calls.filter((c) => c[0] === "accept")).toEqual([["accept", "c1", "b1"]]);
  expect(view.getAllByText("Expired").length).toBeGreaterThan(0);
});

test("an empty view shows its empty state", async () => {
  const { view } = renderView("received", { orders: { receivedBy: async () => ({ data: [] }) } });
  await waitFor(() => expect(view.getByText("No offers received yet")).toBeTruthy());
});
