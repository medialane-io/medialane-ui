import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/portfolio/received", useSearchParams: () => new URLSearchParams() }));

const { PortfolioShell, PORTFOLIO_TABS } = await import("./portfolio-shell.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => { cleanup(); localStorage.clear(); });

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const offer = (h: string) => ({ orderHash: h, offerer: OTHER, status: "ACTIVE", offer: { itemType: "ERC20" }, consideration: { itemType: "ERC721" } });

function renderShell(app: Partial<MedialaneApp>, props: Partial<Parameters<typeof PortfolioShell>[0]> = {}) {
  const client = { api: {
    getOrdersByUser: async () => ({ data: [] }),
    getReceivedOffers: async () => ({ data: [offer("r1"), offer("r2")] }),
    getRewards: async () => null,
    getSponsorshipOffers: async () => ({ data: [] }),
    getSponsorshipProposals: async () => ({ data: [] }),
    getSponsorshipLicenses: async () => ({ data: [] }),
  } } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: ME, onRequireWallet: () => {}, ...app } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={value}><PortfolioShell {...props}><p>tab body</p></PortfolioShell></MedialaneAppProvider></SWRConfig>);
}

test("signed out shows the app's sign-in", () => {
  let asked = 0;
  const view = renderShell({ walletAddress: null, connectLabel: "Connect with email", onRequireWallet: () => { asked++; } });
  expect(view.queryByText("tab body")).toBeNull();
  fireEvent.click(view.getByText("Connect with email"));
  expect(asked).toBe(1);
});

test("while the wallet is loading nothing asks to sign in", () => {
  const view = renderShell({ walletAddress: null, walletLoading: true });
  expect(view.queryByRole("button")).toBeNull();
  expect(view.queryByText("tab body")).toBeNull();
});

test("signed in shows the tabs with the received count and the tab body", async () => {
  const view = renderShell({});
  expect(view.getByText("tab body")).toBeTruthy();
  await waitFor(() => expect(view.getByText("Offers received (2)")).toBeTruthy());
  expect(view.getByText("Assets")).toBeTruthy();
});

test("an app can pass its own tabs", () => {
  const tabs = PORTFOLIO_TABS.flatMap((t) => (t.key === "collections" ? [t, { key: "coins", label: "Coins", href: "/portfolio/coins" }] : [t]));
  const view = renderShell({}, { tabs });
  expect(view.getByText("Coins")).toBeTruthy();
});
