import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { TransactionPhase } from "../utils/use-transaction.js";

mock.module("../utils/media-wallet/confetti.js", () => ({ fireConfetti: () => {} }));

const { TransactionDialog } = await import("./transaction-dialog.js");

afterEach(() => cleanup());

function renderDialog(phase: TransactionPhase, extra: { error?: string | null; reset?: () => void } = {}) {
  const tx = { phase, error: extra.error ?? null, reset: extra.reset ?? (() => {}) };
  return render(
    <TransactionDialog tx={tx} title="Create collection" workingLabel="Creating your collection…" firstStepLabel="Upload metadata">
      <p>All done</p>
    </TransactionDialog>,
  );
}

test("marks the active step while working", () => {
  renderDialog("submitting");
  const steps = Array.from(document.querySelectorAll("[data-step]"));
  expect(steps.map((s) => s.textContent)).toEqual(["Upload metadata", "Submit transaction", "Confirm transaction"]);
  expect(steps.filter((s) => s.getAttribute("aria-current") === "step").map((s) => s.textContent)).toEqual(["Submit transaction"]);
});

test("stays open when dismissed while working", () => {
  let resets = 0;
  renderDialog("confirming", { reset: () => { resets += 1; } });
  fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
  expect(resets).toBe(0);
  expect(document.body.textContent).toContain("Creating your collection…");
});

test("shows the error and Try again resets", () => {
  let resets = 0;
  const view = renderDialog("error", { error: "Nope", reset: () => { resets += 1; } });
  expect(document.body.textContent).toContain("Nope");
  fireEvent.click(view.getByText("Try again"));
  expect(resets).toBe(1);
});

test("falls back to a plain message for an empty error", () => {
  renderDialog("error", { error: null });
  expect(document.body.textContent).toContain("We couldn't complete that. Please try again.");
});

test("renders its children on success and no step list", () => {
  renderDialog("success");
  expect(document.body.textContent).toContain("All done");
  expect(document.querySelectorAll("[data-step]").length).toBe(0);
});

test("renders nothing while idle", () => {
  renderDialog("idle");
  expect(document.body.textContent).not.toContain("Creating your collection…");
});
