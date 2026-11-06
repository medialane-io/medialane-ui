import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { TransactionDialogStates } = await import("./transaction-dialog-states.js");

const render = (props: Partial<Parameters<typeof TransactionDialogStates>[0]> = {}) =>
  renderToStaticMarkup(
    <TransactionDialogStates
      phase="idle"
      txHash={null}
      error={null}
      success={{ title: "Listing cancelled", description: "It is off the marketplace." }}
      successName="Sunrise"
      errorTitle="Cancellation failed"
      errorDescription="It could not be cancelled."
      onDone={() => {}}
      {...props}
    >
      <p>the form</p>
    </TransactionDialogStates>,
  );

test("idle shows the form", () => {
  expect(render()).toContain("the form");
});

test("a busy phase shows progress and hides the form", () => {
  const html = render({ phase: "submitting", statusMessage: "Cancelling…" });
  expect(html).toContain("Cancelling…");
  expect(html).not.toContain("the form");
});

test("a busy phase links the transaction once it is known", () => {
  expect(render({ phase: "confirming", txHash: "0xabc123def456" })).toContain("0xabc123");
});

test("success shows the message and a Done action", () => {
  const html = render({ phase: "success", txHash: "0xabc123def456" });
  expect(html).toContain("Listing cancelled");
  expect(html).toContain("Done");
  expect(html).not.toContain("the form");
});

test("an error after the transaction was sent shows the failure screen", () => {
  const html = render({ phase: "error", txHash: "0xabc123def456", error: "reverted" });
  expect(html).toContain("Cancellation failed");
  expect(html).toContain("reverted");
  expect(html).not.toContain("the form");
});

test("an error before anything was sent stays on the form", () => {
  const html = render({ phase: "error", error: "wallet closed" });
  expect(html).toContain("the form");
  expect(html).not.toContain("Cancellation failed");
});
