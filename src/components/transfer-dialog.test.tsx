import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { TransferDialog } = await import("./transfer-dialog.js");

afterEach(() => cleanup());

type Tx = Parameters<typeof TransferDialog>[0]["tx"];

function show(overrides: Partial<Parameters<typeof TransferDialog>[0]> = {}, tx: Partial<Tx> = {}) {
  const calls = { transfers: [] as string[], resets: 0, closes: 0, successes: 0 };
  const props = {
    open: true,
    onOpenChange: (value: boolean) => { if (!value) calls.closes++; },
    tokenId: "1",
    tokenName: "Sunrise",
    walletAddress: "0xabc",
    canTransfer: true,
    connectLabel: "Connect to transfer",
    footerNote: "Recorded onchain.",
    tx: { phase: "idle", txHash: null, error: null, reset: () => { calls.resets++; }, ...tx } as Tx,
    onTransfer: (to: string) => { calls.transfers.push(to); },
    onSuccess: () => { calls.successes++; },
    ...overrides,
  };
  render(<TransferDialog {...props} />);
  return calls;
}

async function toConfirm(to: string) {
  fireEvent.change(screen.getByPlaceholderText("0x…"), { target: { value: to } });
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^Transfer$/ })); });
  await screen.findByText("Transfer this asset?");
}

describe("TransferDialog", () => {
  test("the recipient is confirmed before anything is sent", async () => {
    const calls = show();
    await toConfirm("0x123");
    expect(calls.transfers).toEqual([]);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^Transfer$/ })); });
    expect(calls.transfers).toEqual(["0x123"]);
  });

  test("an address that is not hex is refused", async () => {
    show();
    fireEvent.change(screen.getByPlaceholderText("0x…"), { target: { value: "nope" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^Transfer$/ })); });
    await screen.findByText(/Must be a valid Starknet address/);
  });

  test("sending to your own address is refused", async () => {
    show();
    fireEvent.change(screen.getByPlaceholderText("0x…"), { target: { value: "0xabc" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /^Transfer$/ })); });
    await screen.findByText("Cannot transfer to yourself");
  });

  test("without a wallet the button shows the connect label and is disabled", () => {
    show({ canTransfer: false });
    const button = screen.getByRole("button", { name: "Connect to transfer" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test("an active listing is called out", () => {
    show({ hasActiveListing: true });
    expect(screen.getByText(/active listing/)).toBeTruthy();
  });

  test("success shows Done, which closes and reports success", async () => {
    const calls = show({}, { phase: "success", txHash: "0xtx" });
    fireEvent.click(await screen.findByRole("button", { name: "Done" }));
    expect(calls.closes).toBe(1);
    expect(calls.successes).toBe(1);
  });

  test("a failure after the transaction was sent shows the failure screen and Try again resets", async () => {
    const calls = show({}, { phase: "error", txHash: "0xtx", error: "Reverted" });
    await screen.findByText("Reverted");
    const resetsBefore = calls.resets;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(calls.resets).toBeGreaterThan(resetsBefore);
  });

  test("a failure before anything was sent stays on the form with the error", async () => {
    show({}, { phase: "error", error: "Wallet closed" });
    await screen.findByText("Wallet closed");
    expect(screen.getByPlaceholderText("0x…")).toBeTruthy();
  });

  test("closing is ignored while the transaction runs", () => {
    const calls = show({}, { phase: "confirming" });
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(calls.closes).toBe(0);
  });
});
