import { expect, test, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
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

test("shows each account as a card with its featured asset, linking to its account page", async () => {
  const view = renderPage(async () => ({
    data: [
      { address: A, image: "https://img.test/a.png", ipType: "Art" },
      { address: B, image: null, ipType: null },
    ],
    meta: { page: 1, limit: 24, total: 20000 },
  }));

  await waitFor(() => expect(view.getByText("0x000000…000abc")).toBeTruthy());
  expect(view.getByText("20,000")).toBeTruthy();
  const hrefs = Array.from(view.container.querySelectorAll("a"))
    .map((a) => a.getAttribute("href"))
    .filter((href) => href?.startsWith("/account/"));
  expect(hrefs).toEqual([`/account/${A}`, `/account/${B}`]);
});

test("a type of work asks for the accounts holding it", async () => {
  const calls: unknown[] = [];
  const view = renderPage(async (opts) => {
    calls.push(opts);
    return { data: [], meta: { page: 1, limit: 24, total: 0 } };
  });
  await waitFor(() => expect(calls.length).toBe(1));

  fireEvent.click(view.getByRole("button", { name: "Audio" }));

  await waitFor(() => expect(calls[calls.length - 1]).toEqual({ search: undefined, ipType: "audio", page: 1, limit: 24 }));
  expect(view.getByRole("button", { name: "Audio" }).getAttribute("aria-pressed")).toBe("true");
});

test("shows an empty state when there are no accounts", async () => {
  const view = renderPage(async () => ({ data: [], meta: { page: 1, limit: 24, total: 0 } }));
  await waitFor(() => expect(view.getByText("No accounts found")).toBeTruthy());
});
