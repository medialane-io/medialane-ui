import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/launchpad/remix", useSearchParams: () => new URLSearchParams() }));

const { RemixBrowsePage } = await import("./remix-browse-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

test("lists works open to remixing, each linking to its remix form", async () => {
  const calls: unknown[] = [];
  const client = { api: { tokens: { list: async (q: unknown) => { calls.push(q); return { data: [{ contractAddress: "0xc1", tokenId: "7", metadata: { name: "Loop", image: null } }], meta: { total: 1 } }; } } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  const view = render(<MedialaneAppProvider value={app}><RemixBrowsePage /></MedialaneAppProvider>);
  await waitFor(() => expect(view.getByText("Loop")).toBeTruthy());
  expect(Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toContain("/create/remix/0xc1/7");
  expect(calls[0]).toEqual({ derivatives: "allowed", limit: 24, page: 1 });
});
