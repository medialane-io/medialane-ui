import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { LeaderboardPanel } = await import("./leaderboard-panel.js");
const { MedialaneAppProvider } = await import("../medialane-app.js");

afterEach(() => cleanup());

const A = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const B = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const entry = (rank: number, address: string) => ({ rank, address, accountId: null, publicId: null, totalXp: 100 * rank, currentLevel: 1, currentLevelName: "Seed", badgeColor: "#000" });

function renderPanel(rows: unknown[]) {
  const client = { api: {
    getRewardsLeaderboard: async () => ({ data: rows, meta: { page: 1, limit: 12, total: rows.length } }),
    getCreatorProfile: async (address: string) => (address === A ? { walletAddress: A, username: "drummer", name: "Drum Kit", avatarImage: null } : null),
  } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><LeaderboardPanel limit={12} /></MedialaneAppProvider></SWRConfig>);
}

test("rows link to each profile and show the name when there is one", async () => {
  const view = renderPanel([entry(1, A), entry(2, B)]);
  await waitFor(() => expect(view.getByText("@drummer")).toBeTruthy());
  const hrefs = Array.from(view.container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
  expect(hrefs).toContain(`/account/${A}`);
  expect(hrefs).toContain(`/account/${B}`);
});

test("an empty leaderboard invites the first points", async () => {
  const view = renderPanel([]);
  await waitFor(() => expect(view.getByText(/be the first/)).toBeTruthy());
});
