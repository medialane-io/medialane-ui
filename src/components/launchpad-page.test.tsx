import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { LaunchpadPage } = await import("./launchpad-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

function renderPage(props: Partial<Parameters<typeof LaunchpadPage>[0]> = {}) {
  const client = { api: { listCollections: async () => ({ data: [] }) } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><LaunchpadPage fastMint={<div>app fast mint</div>} {...props} /></MedialaneAppProvider></SWRConfig>);
}

test("shows the app's quick mint and the services", () => {
  const view = renderPage();
  expect(view.getByText("Creator Launchpad")).toBeTruthy();
  expect(view.getByText("app fast mint")).toBeTruthy();
  expect(view.getByText("Launchpad Services")).toBeTruthy();
});

test("an app can hide service groups", () => {
  const all = renderPage().container.textContent ?? "";
  cleanup();
  const hidden = renderPage({ hideGroups: ["claims"] }).container.textContent ?? "";
  expect(all.length).toBeGreaterThan(hidden.length);
});
