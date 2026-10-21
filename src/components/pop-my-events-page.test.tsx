import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { PopMyEventsPage } = await import("./pop-my-events-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

function renderPage(app: Partial<MedialaneApp>, events: unknown[] = []) {
  const client = { api: new Proxy({}, { get: () => async () => ({ data: events, meta: { total: events.length } }) }) } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {}, ...app } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={value}><PopMyEventsPage /></MedialaneAppProvider></SWRConfig>);
}

test("signed out asks to sign in with the app's sign-in", () => {
  let asked = 0;
  const view = renderPage({ connectLabel: "Connect wallet", onRequireWallet: () => { asked++; } });
  fireEvent.click(view.getByText("Connect wallet"));
  expect(asked).toBe(1);
});

test("signed in with no events offers to create one", async () => {
  const view = renderPage({ walletAddress: "0xa" });
  await waitFor(() => expect(view.getByText("No events yet")).toBeTruthy());
  expect(Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toContain("/launchpad/pop/create");
});
