import { afterEach, expect, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";
import { PortfolioCollections } from "./portfolio-collections.js";

afterEach(cleanup);

function renderPage() {
  const client = { api: { collections: { list: async () => ({ data: [] }) } } } as unknown as MedialaneClient;
  const value = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xabc", onRequireWallet: () => {} } as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={value}>
        <PortfolioCollections claimPanel={<p>claim panel</p>} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
}

test("with no collections it offers both types and the claim panel the app passes in", async () => {
  const view = renderPage();
  await waitFor(() => expect(view.getByText("No collections yet")).toBeTruthy());
  expect(view.getByText("Single edition")).toBeTruthy();
  expect(view.getByText("Multi edition")).toBeTruthy();
  expect(view.getByText("claim panel")).toBeTruthy();
});
