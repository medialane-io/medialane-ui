import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { CollectionNameClaim } = await import("./collection-name-claim.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

test("each owned collection links to its name settings", async () => {
  const client = { api: { listCollections: async () => ({ data: [
    { id: "1", contractAddress: "0xc1", name: "Loops", image: null, profile: { slug: "loops" } },
    { id: "2", contractAddress: "0xc2", name: "Drafts", image: null, profile: null },
  ] }) } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xa", onRequireWallet: () => {} } as MedialaneApp;
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><CollectionNameClaim /></MedialaneAppProvider></SWRConfig>);
  await waitFor(() => expect(view.getByText("Loops")).toBeTruthy());
  expect(view.getByText("Edit name")).toBeTruthy();
  expect(view.getByText("Set name")).toBeTruthy();
  const hrefs = Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
  expect(hrefs).toContain("/portfolio/collections/0xc1/settings");
  expect(hrefs).toContain("/portfolio/collections/0xc2/settings");
});
