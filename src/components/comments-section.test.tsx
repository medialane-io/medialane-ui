import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { MedialaneAppProvider, type MedialaneApp, type ReportTarget } from "./medialane-app.js";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));
mock.module("../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));
mock.module("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

const { CommentsSection } = await import("./comments-section.js");

afterEach(() => cleanup());

const ME = "0x00000000000000000000000000000000000000000000000000000000000000aa";
const OTHER = "0x00000000000000000000000000000000000000000000000000000000000000bb";
const C = "0x00000000000000000000000000000000000000000000000000000000000000c1";

function setup(walletAddress: string | null) {
  const intents: { kind: string; params: Record<string, unknown> }[] = [];
  const reports: ReportTarget[] = [];
  let connects = 0;
  const comment = { id: "k1", author: OTHER, content: "Great work", postedAt: new Date().toISOString(), txHash: null };
  const client = {
    provider: { getTransactionReceipt: async () => ({ execution_status: "SUCCEEDED", events: [] }) },
    api: {
      tokens: { comments: async () => ({ data: [comment], meta: { total: 1 } }) },
      intents: {
        create: async (kind: string, params: Record<string, unknown>) => { intents.push({ kind, params }); return { id: "i1", requiresSignature: false, calls: [{}] }; },
        syncTransaction: async () => ({ pending: false }),
      },
      rewards: { config: async () => ({ actions: [], levels: [] }) },
    },
  } as unknown as MedialaneClient;
  const app = {
    getClient: () => client,
    getSigner: () => ({ address: ME, execute: async () => ({ txHash: "0xabc" }), signTypedData: async () => [] }),
    walletAddress,
    onRequireWallet: () => { connects++; },
    connectLabel: "Connect with email",
    ReportDialog: ({ open, target }: { open: boolean; target: ReportTarget }) => { if (open) reports.push(target); return null; },
  } as unknown as MedialaneApp;
  const view = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MedialaneAppProvider value={app}>
        <CommentsSection contract={C} tokenId="1" />
      </MedialaneAppProvider>
    </SWRConfig>,
  );
  return { view, intents, reports, connects: () => connects };
}

test("a visitor without a wallet is asked to connect, not to write", async () => {
  const { view, connects } = setup(null);
  await waitFor(() => expect(view.getByText("Great work")).toBeTruthy());
  fireEvent.click(view.getByText("Connect with email to comment"));
  expect(connects()).toBe(1);
  expect(view.queryByPlaceholderText("Say something onchain… it's permanent.")).toBeNull();
});

test("a comment is posted onchain with its text trimmed", async () => {
  const { view, intents } = setup(ME);
  await waitFor(() => expect(view.getByText("Great work")).toBeTruthy());
  fireEvent.change(view.getByPlaceholderText("Say something onchain… it's permanent."), { target: { value: "  Thank you  " } });
  fireEvent.click(view.getByText("Post onchain"));
  await waitFor(() => expect(view.getByText("Comment posted!")).toBeTruthy());
  expect(intents[0]).toEqual({ kind: "comment", params: { author: ME, nftContract: C, tokenId: "1", text: "Thank you" } });
});

test("someone else's comment can be reported", async () => {
  const { view, reports } = setup(ME);
  await waitFor(() => expect(view.getByLabelText("Report comment")).toBeTruthy());
  fireEvent.click(view.getByLabelText("Report comment"));
  expect(reports[0]).toEqual({ type: "COMMENT", commentId: "k1" });
});
