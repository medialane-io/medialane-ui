import { afterEach, expect, test, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost:3000" });

mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
const { MotionGlobalConfig } = await import("framer-motion");
MotionGlobalConfig.skipAnimations = true;

const { cleanup, render, waitFor, fireEvent } = await import("@testing-library/react");
const { SWRConfig } = await import("swr");
const { AssetOwnersPanel } = await import("./asset-owners-panel.js");
const { MedialaneAppProvider } = await import("./medialane-app.js");
import type { MedialaneApp } from "./medialane-app.js";

afterEach(() => cleanup());

test("more owners opens every owner, read page by page", async () => {
  const pages: number[] = [];
  const client = {
    api: new Proxy({
      getTokenOwners: async (_c: string, _t: string, page: number) => {
        pages.push(page);
        return { data: [{ owner: `0x${page}aa`, amount: "1" }], meta: { total: 2 } };
      },
    } as Record<string, unknown>, { get: (t, k: string) => t[k] ?? (async () => ({ data: null })) }),
  };
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as unknown as MedialaneApp;
  const holders = Array.from({ length: 5 }, (_, i) => ({ owner: `0x${i + 1}`, amount: "1" }));

  const { getByText } = render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MedialaneAppProvider value={app}>
        <AssetOwnersPanel contract="0xc0" tokenId="1" balances={holders} total={7} />
      </MedialaneAppProvider>
    </SWRConfig>,
  );

  fireEvent.click(getByText("+2 more owners"));
  await waitFor(() => expect(getByText("Show more")).toBeTruthy());
  fireEvent.click(getByText("Show more"));
  await waitFor(() => expect(pages).toEqual([1, 2]));
});
