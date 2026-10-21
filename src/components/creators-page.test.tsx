import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { CreatorsPage } = await import("./creators-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(() => cleanup());

test("creators link to their profiles", async () => {
  const client = { api: {
    getCreators: async () => ({ creators: [
      { walletAddress: "0xa1", username: "drummer", name: "Drum Kit", bio: null, avatarImage: null },
      { walletAddress: "0xb2", username: null, name: null, bio: null, avatarImage: null },
    ], total: 2 }),
    listCollections: async () => ({ data: [] }),
  } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><CreatorsPage /></MedialaneAppProvider></SWRConfig>);
  await waitFor(() => expect(view.getAllByText(/drummer/).length).toBeGreaterThan(0));
  const hrefs = Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
  expect(hrefs).toContain("/creator/drummer");
  expect(hrefs).toContain("/account/0xb2");
});
