import { afterEach, expect, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp } from "../medialane-app.js";
import { RewardEarned } from "./reward-earned.js";

afterEach(() => cleanup());

function renderEarned(actionType: string) {
  const client = {
    api: { rewards: { config: async () => ({ actions: [{ type: "create_collection", xp: 50, label: "Create a collection" }], levels: [] }) } },
  } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
  return render(<MedialaneAppProvider value={app}><RewardEarned actionType={actionType} /></MedialaneAppProvider>);
}

test("shows the XP for a rewarded action once the config loads", async () => {
  const view = renderEarned("create_collection");
  await waitFor(() => expect(view.getByText("+50 XP")).toBeTruthy());
  expect(view.getByText("Create a collection")).toBeTruthy();
});

test("shows nothing for an action with no reward", async () => {
  const view = renderEarned("unknown_action");
  await new Promise((r) => setTimeout(r, 20));
  expect(view.container.textContent).toBe("");
});
