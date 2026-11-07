import { expect, test, afterEach } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import type { SelfFundConsent, SelfFundFeeEstimate } from "@medialane/sdk/starknet";
import { SelfFundConsentDialog } from "./self-fund-consent-dialog.js";

afterEach(() => cleanup());

function setup() {
  let handler: ((fee: Promise<SelfFundFeeEstimate | null>) => Promise<boolean>) | null = null;
  const consent = { registerHandler: (h: typeof handler) => { handler = h; } } as unknown as SelfFundConsent;
  const view = render(<SelfFundConsentDialog consent={consent} />);
  const ask = (fee: SelfFundFeeEstimate | null) => {
    let answer: Promise<boolean> = Promise.resolve(false);
    act(() => { answer = handler!(Promise.resolve(fee)); });
    return answer;
  };
  return { view, ask };
}

const fee = (feeRaw: bigint, balanceRaw: bigint): SelfFundFeeEstimate => ({ feeRaw, balanceRaw, unit: "FRI" }) as SelfFundFeeEstimate;

test("shows the fee and resolves true when the person agrees to pay", async () => {
  const { view, ask } = setup();
  const answer = ask(fee(10n ** 15n, 10n ** 18n));
  expect(await view.findByRole("dialog")).toBeTruthy();
  fireEvent.click(await view.findByRole("button", { name: /^Pay / }));
  expect(await answer).toBe(true);
});

test("Try again later resolves false and closes", async () => {
  const { view, ask } = setup();
  const answer = ask(fee(10n ** 15n, 10n ** 18n));
  fireEvent.click(await view.findByRole("button", { name: "Try again later" }));
  expect(await answer).toBe(false);
  expect(view.queryByRole("dialog")).toBeNull();
});

test("Escape counts as declining", async () => {
  const { view, ask } = setup();
  const answer = ask(null);
  fireEvent.keyDown(await view.findByRole("dialog"), { key: "Escape" });
  expect(await answer).toBe(false);
});

test("paying is off when the balance cannot cover the fee", async () => {
  const { view, ask } = setup();
  ask(fee(10n ** 18n, 10n ** 15n));
  const pay = (await view.findByRole("button", { name: /^Pay / })) as HTMLButtonElement;
  expect(pay.disabled).toBe(true);
});
