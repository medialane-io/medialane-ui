import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
const replaced: string[] = [];
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: (h: string) => replaced.push(h), back: () => {} }), usePathname: () => "/create/licensing/0xc1/7", useSearchParams: () => new URLSearchParams() }));

const { LicenseRequestPage } = await import("./license-request-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OWNER = "0x00000000000000000000000000000000000000000000000000000000000000bb";

function renderPage(app: Partial<MedialaneApp>) {
  const submitted: unknown[] = [];
  const api: Record<string, unknown> = {
    getToken: async () => ({ data: { contractAddress: "0xc1", tokenId: "7", owner: OWNER, metadata: { name: "Loop", image: null, attributes: [] }, balances: [] } }),
    getCollection: async () => ({ data: { contractAddress: "0xc1", name: "Loops", service: "mip-erc721" } }),
    getTokenBalance: async () => ({ data: { amount: "0" } }),
    submitRemixOffer: async (body: unknown) => { submitted.push(body); return { data: { id: "r1" } }; },
  };
  const client = { api: new Proxy(api, { get: (t, k: string) => t[k] ?? (async () => ({ data: null })) }) } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {}, ...app } as MedialaneApp;
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={value}><LicenseRequestPage contract="0xc1" tokenId="7" /></MedialaneAppProvider></SWRConfig>);
  return { view, submitted };
}

test("signed out asks to sign in with the app's sign-in", async () => {
  const { view } = renderPage({ connectLabel: "Connect with email" });
  await waitFor(() => expect(view.getByText("Sign in to request a license")).toBeTruthy());
  expect(view.getByText("Connect with email")).toBeTruthy();
});

test("a signed-in visitor's request makes sure the account is signed in, then sends it", async () => {
  const order: string[] = [];
  const { view, submitted } = renderPage({ walletAddress: ME, ensureSignedIn: async () => { order.push("signed in"); } });
  await waitFor(() => expect(view.getByText("License this asset")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("0.00"), { target: { value: "2" } });
  fireEvent.click(view.getByRole("button", { name: /Send/i }));
  await waitFor(() => expect(submitted.length).toBe(1));
  expect(order).toEqual(["signed in"]);
  expect(submitted[0]).toEqual(expect.objectContaining({ originalContract: "0xc1", originalTokenId: "7", licenseType: "CC BY" }));
});

test("an empty fee asks for a fee and sends nothing", async () => {
  const { view, submitted } = renderPage({ walletAddress: ME });
  await waitFor(() => expect(view.getByText("License this asset")).toBeTruthy());
  fireEvent.click(view.getByRole("button", { name: /Send/i }));
  await waitFor(() => expect(view.getByText("Enter a license fee")).toBeTruthy());
  expect(submitted.length).toBe(0);
});
