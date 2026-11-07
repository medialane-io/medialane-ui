import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ApiCollection, ApiRemixOffer } from "@medialane/sdk";
import { ApproveMintDialog, type ApproveMintDialogProps } from "./approve-mint-dialog.js";

afterEach(() => cleanup());

const OFFER = { originalContract: "0xc2", originalTokenId: "7", licenseType: "CC BY", message: "Please", price: { formatted: "2.5", currency: "STRK" } } as unknown as ApiRemixOffer;
const COLLECTIONS = [
  { contractAddress: "0xc1", collectionId: "1", name: "First", standard: "ERC721" },
  { contractAddress: "0xc2", collectionId: "2", name: "Second", standard: "ERC721" },
] as unknown as ApiCollection[];

function show(over: Partial<ApproveMintDialogProps> = {}) {
  const approved: Array<[string, string]> = [];
  const resets: number[] = [];
  const view = render(
    <ApproveMintDialog
      offer={OFFER}
      open
      onOpenChange={() => {}}
      collections={COLLECTIONS}
      footerNote="Gas is free."
      tx={{ phase: "idle", txHash: null, error: null, reset: () => resets.push(1) }}
      onApprove={(c, name) => approved.push([c.contractAddress, name])}
      {...over}
    />,
  );
  return { view, approved, resets };
}

test("shows the offer and mints into the collection the offer came from by default", () => {
  const { view, approved } = show();
  expect(view.getByText("CC BY")).toBeTruthy();
  expect(view.getByText("2.50 STRK")).toBeTruthy();
  fireEvent.click(view.getByRole("button", { name: /Grant license/ }));
  expect(approved).toEqual([["0xc2", "Remix of Token #7"]]);
});

test("sends the typed remix name", () => {
  const { view, approved } = show();
  fireEvent.change(view.getByLabelText("Remix Name"), { target: { value: "My remix" } });
  fireEvent.click(view.getByRole("button", { name: /Grant license/ }));
  expect(approved[0]![1]).toBe("My remix");
});

test("without an eligible collection it says so and cannot be submitted", () => {
  const { view } = show({ collections: [] });
  expect(view.getByText("No eligible collections.")).toBeTruthy();
  expect((view.getByRole("button", { name: /Grant license/ }) as HTMLButtonElement).disabled).toBe(true);
});

test("a failure before anything was sent shows inline and keeps the form", () => {
  const { view } = show({ tx: { phase: "error", txHash: null, error: "Select a collection", reset: () => {} } });
  expect(view.getByText("Select a collection")).toBeTruthy();
  expect(view.getByRole("button", { name: /Grant license/ })).toBeTruthy();
});

test("success shows the licence and a link to the new asset", () => {
  const { view } = show({ tx: { phase: "success", txHash: "0xabc", error: null, reset: () => {} }, newAssetHref: "/asset/0xc2/9" });
  expect(view.getByText("License granted")).toBeTruthy();
  expect(view.getByText("View new asset").closest("a")?.getAttribute("href")).toBe("/asset/0xc2/9");
});
