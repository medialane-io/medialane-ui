import { expect, test, afterEach } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { MedialaneApiError, UserFacingError } from "@medialane/sdk";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { ReportDialog } from "./report-dialog.js";
import { MedialaneAppProvider, type MedialaneApp, type ReportTarget } from "./medialane-app.js";

afterEach(() => cleanup());

function setup(opts: { ensureSignedIn?: () => Promise<void>; submit?: (body: unknown) => Promise<unknown> } = {}) {
  const sent: unknown[] = [];
  const closes: boolean[] = [];
  const client = { api: { platform: { submitReport: async (body: unknown) => { sent.push(body); return opts.submit ? opts.submit(body) : {}; } } } } as unknown as MedialaneClient;
  const app = { getClient: () => client, getSigner: () => { throw new Error("unused"); }, walletAddress: "0xaa", onRequireWallet: () => {}, ensureSignedIn: opts.ensureSignedIn } as MedialaneApp;
  const target: ReportTarget = { type: "TOKEN", contract: "0xc1", tokenId: "7", name: "Loop" };
  const view = render(<MedialaneAppProvider value={app}><ReportDialog open target={target} onOpenChange={(o) => closes.push(o)} /></MedialaneAppProvider>);
  return { view, sent, closes };
}

test("submit stays off until a reason is picked, then sends the report", async () => {
  const order: string[] = [];
  const { view, sent } = setup({ ensureSignedIn: async () => { order.push("signed in"); } });
  const submit = view.getByRole("button", { name: "Submit Report" }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);
  fireEvent.click(view.getByLabelText("Spam"));
  fireEvent.click(submit);
  await waitFor(() => expect(view.getByText("Report submitted")).toBeTruthy());
  expect(order).toEqual(["signed in"]);
  expect(sent[0]).toEqual({ targetType: "TOKEN", categories: ["SPAM"], description: undefined, targetContract: "0xc1", targetTokenId: "7" });
});

test("a failed sign-in shows the reason and sends nothing", async () => {
  const { view, sent } = setup({ ensureSignedIn: async () => { throw new UserFacingError("Secure your account first"); } });
  fireEvent.click(view.getByLabelText("Spam"));
  fireEvent.click(view.getByRole("button", { name: "Submit Report" }));
  await waitFor(() => expect(view.getByText("Secure your account first")).toBeTruthy());
  expect(sent.length).toBe(0);
});

test("an already-reported item says so and can be retried or dismissed", async () => {
  const { view, closes } = setup({ submit: async () => { throw new MedialaneApiError(409, "dup"); } });
  fireEvent.click(view.getByLabelText("Spam"));
  fireEvent.click(view.getByRole("button", { name: "Submit Report" }));
  await waitFor(() => expect(view.getByText("You've already reported this content.")).toBeTruthy());
  fireEvent.click(view.getByRole("button", { name: "Dismiss" }));
  expect(closes).toEqual([false]);
});
