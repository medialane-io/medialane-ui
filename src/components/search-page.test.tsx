import { expect, test, mock } from "bun:test";
import { render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

let params = new URLSearchParams();
mock.module("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  useSearchParams: () => params,
}));
mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { SearchPage } = await import("./search-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

const calls: unknown[][] = [];
const results = {
  creators: [{ walletAddress: "0xw1", username: "drummer", name: "Drum Kit", bio: null, avatarImage: null }, { walletAddress: "0xw2", username: null, name: null, bio: null, avatarImage: null }],
  collections: [{ contractAddress: "0xc1", name: "Drum Loops", image: null, totalSupply: null, floorPrice: null, holderCount: null }],
  tokens: [{ contractAddress: "0xc1", tokenId: "7", name: "Drum Loop 7", image: null, owner: "0xw1", metadataStatus: "FETCHED" }],
};
const empty = { creators: [], collections: [], tokens: [] };

function renderWith(q: string, search: (...a: unknown[]) => Promise<unknown>) {
  params = new URLSearchParams(q ? { q } : {});
  const client = { api: { search: async (...a: unknown[]) => { calls.push(a); return search(...a); } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(<MedialaneAppProvider value={app}><SearchPage /></MedialaneAppProvider>);
}

test("an empty query shows the prompt and reads nothing", async () => {
  calls.length = 0;
  const view = renderWith("", async () => ({ data: empty }));
  expect(view.getByText(/Type above to search/)).toBeTruthy();
  await new Promise((r) => setTimeout(r, 20));
  expect(calls).toEqual([]);
  view.unmount();
});

test("a one-character query reads nothing", async () => {
  calls.length = 0;
  const view = renderWith("a", async () => ({ data: empty }));
  await new Promise((r) => setTimeout(r, 20));
  expect(calls).toEqual([]);
  view.unmount();
});

test("results list creators, collections and assets with their links", async () => {
  calls.length = 0;
  const view = renderWith("drum", async () => ({ data: results }));
  await waitFor(() => expect(view.getByText("Drum Loop 7")).toBeTruthy());
  const hrefs = Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
  expect(hrefs).toContain("/creator/drummer");
  expect(hrefs).toContain("/account/0xw2");
  expect(hrefs).toContain("/collections/starknet/0xc1");
  expect(hrefs).toContain("/asset/starknet/0xc1/7");
  expect(calls).toEqual([["drum", 50]]);
  view.unmount();
});

test("no results shows a gentle empty state", async () => {
  const view = renderWith("zzz", async () => ({ data: empty }));
  await waitFor(() => expect(view.getByText('Nothing here for "zzz" yet')).toBeTruthy());
  view.unmount();
});

test("a failed search shows the same empty state", async () => {
  const view = renderWith("boom", async () => { throw new Error("down"); });
  await waitFor(() => expect(view.getByText('Nothing here for "boom" yet')).toBeTruthy());
  expect(view.queryByText(/unavailable|could not/i)).toBeNull();
  view.unmount();
});
