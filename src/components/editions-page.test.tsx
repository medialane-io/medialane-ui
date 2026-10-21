import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/launchpad/nfteditions", useSearchParams: () => new URLSearchParams() }));

const { EditionsPage } = await import("./editions-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

function renderPage(walletAddress: string | null) {
  const client = { api: { listCollections: async () => ({ data: [] }) } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress, onRequireWallet: () => {}, connectLabel: "Connect wallet" } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><EditionsPage /></MedialaneAppProvider></SWRConfig>);
}

test("signed out asks to sign in", () => {
  const view = renderPage(null);
  expect(view.getByText("Sign in to see your collections")).toBeTruthy();
  expect(view.getByText("Connect wallet")).toBeTruthy();
});

test("signed in with no editions offers to create a collection", async () => {
  const view = renderPage("0xa");
  await waitFor(() => expect(view.getByText("No editions collections yet")).toBeTruthy());
  expect(Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toContain("/launchpad/nfteditions/create");
});
