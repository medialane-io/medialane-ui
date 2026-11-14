import { expect, test, afterEach } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";
import { AccountsPage } from "./accounts-page.js";
import { MedialaneAppProvider } from "./medialane-app.js";

afterEach(() => cleanup());

const A = "0x0000000000000000000000000000000000000000000000000000000000000abc";
const B = "0x0000000000000000000000000000000000000000000000000000000000000def";

function renderPage(list: (opts: { search?: string; page?: number; limit?: number }) => Promise<unknown>) {
  const client = { api: { accounts: { list } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <AccountsPage />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
}

test("lists onchain accounts by address with their counts, each linking to its account page", async () => {
  const view = renderPage(async () => ({
    data: [
      { address: A, collections: 2, assets: 1 },
      { address: B, collections: 0, assets: 3 },
    ],
    meta: { page: 1, limit: 24, total: 2 },
  }));

  await waitFor(() => expect(view.getByText("2 collections · 1 asset")).toBeTruthy());
  expect(view.getByText("0 collections · 3 assets")).toBeTruthy();
  expect(view.getByText("2")).toBeTruthy();
  const hrefs = Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
  expect(hrefs).toEqual([`/account/${A}`, `/account/${B}`]);
});

test("shows an empty state when there are no accounts", async () => {
  const view = renderPage(async () => ({ data: [], meta: { page: 1, limit: 24, total: 0 } }));
  await waitFor(() => expect(view.getByText("No accounts yet")).toBeTruthy());
});
