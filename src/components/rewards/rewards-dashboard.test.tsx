import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import type { MedialaneApp } from "../medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { RewardsDashboard, REWARD_ACTION_LABELS } = await import("./rewards-dashboard.js");
const { MedialaneAppProvider } = await import("../medialane-app.js");

afterEach(() => cleanup());

test("signed out, the score panel asks to sign in with the app's sign-in", () => {
  let asked = 0;
  const client = { api: { rewards: { leaderboard: async () => ({ data: [], meta: { page: 1, limit: 12, total: 0 } }), config: async () => null } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => { asked++; }, connectLabel: "Connect with email" } as MedialaneApp;
  const view = render(<SWRConfig value={{ provider: () => new Map() }}><MedialaneAppProvider value={app}><RewardsDashboard /></MedialaneAppProvider></SWRConfig>);
  expect(view.getByText("Sign in to see your score.")).toBeTruthy();
  fireEvent.click(view.getByText("Connect with email"));
  expect(asked).toBe(1);
});

test("ticket actions read as events and tickets", () => {
  expect(REWARD_ACTION_LABELS.create_ticket_collection).toBe("Ticketed events created");
  expect(REWARD_ACTION_LABELS.buy_ticket).toBe("Tickets received");
});
