import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/launchpad/tickets", useSearchParams: () => new URLSearchParams() }));

const { ServiceCollectionsPage } = await import("./service-collections-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

function renderPage(kind: "tickets" | "club", app: Partial<MedialaneApp>) {
  const client = { api: new Proxy({}, { get: () => async () => ({ data: [], meta: { total: 0 } }) }) } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {}, ...app } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={value}><ServiceCollectionsPage kind={kind} /></MedialaneAppProvider></SWRConfig>);
}

test("signed out, the page shows and the collections ask to sign in with the app's sign-in", () => {
  let asked = 0;
  const view = renderPage("tickets", { connectLabel: "Connect with email", onRequireWallet: () => { asked++; } });
  expect(view.getByText("IP Tickets")).toBeTruthy();
  expect(view.getByText("Sign in to see your collections")).toBeTruthy();
  fireEvent.click(view.getByText("Connect with email"));
  expect(asked).toBe(1);
});

test("signed in with no clubs, the club page offers to create one", async () => {
  const view = renderPage("club", { walletAddress: "0xa" });
  expect(view.getByText("IP Club")).toBeTruthy();
  await waitFor(() => expect(view.getByText("No clubs yet")).toBeTruthy());
  expect(Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toContain("/launchpad/club/create");
});
