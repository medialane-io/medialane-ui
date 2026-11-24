import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { PopPage } = await import("./pop-page.js");
const { ActivitiesPage } = await import("./activities-page.js");
const { MyDropsPage } = await import("./drop/my-drops-page.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");

afterEach(cleanup);

const empty = async () => ({ data: [], meta: { page: 1, limit: 10, total: 0 } });

function mount(ui: React.ReactElement, api: Record<string, unknown> = {}) {
  const client = { api: { collections: { list: empty }, activity: { list: empty }, drops: { list: empty }, ...api } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>{ui}</MedialaneAppProvider>
    </SWRConfig>,
  );
}

test("the POP page lists public events and hides private ones", async () => {
  const col = (address: string, name: string, visibility?: string) => ({
    contractAddress: address,
    name,
    chain: "STARKNET",
    symbol: "POP",
    image: null,
    totalSupply: 3,
    attributes: visibility ? [{ trait_type: "Visibility", value: visibility }] : [],
  });
  const view = mount(<PopPage />, {
    collections: { list: async () => ({ data: [col("0x1", "Open Night"), col("0x2", "Secret Night", "Private")], meta: { page: 1, limit: 50, total: 2 } }) },
    chainReads: { popClaimInfo: async () => null },
  });
  expect(view.getByRole("heading", { level: 1 }).textContent).toBe("POP events");
  await waitFor(() => expect(view.getByText("Open Night")).toBeTruthy());
  expect(view.queryByText("Secret Night")).toBeNull();
});

test("the activity page opens with the standard page header", () => {
  const view = mount(<ActivitiesPage />);
  expect(view.getByRole("heading", { level: 1 }).textContent).toBe("Onchain Activity");
});

test("the my drops page opens with the standard page header", () => {
  const view = mount(<MyDropsPage />);
  expect(view.getByRole("heading", { level: 1 }).textContent).toBe("My drops");
});
