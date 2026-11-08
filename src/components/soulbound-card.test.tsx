import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { ApiActivity } from "@medialane/sdk";

const { SoulboundCard, issuedAt } = await import("./soulbound-card.js");

afterEach(() => cleanup());

const event = (type: ApiActivity["type"], timestamp: string) => ({ type, timestamp, chain: "STARKNET", txHash: null }) as ApiActivity;

test("the issue date is the earliest mint, ignoring other events", () => {
  expect(issuedAt([event("transfer", "2026-01-01T00:00:00Z"), event("mint", "2026-10-12T12:00:00Z"), event("mint", "2026-10-13T12:00:00Z")])).toBe("Oct 12, 2026");
  expect(issuedAt([event("transfer", "2026-01-01T00:00:00Z")])).toBeNull();
  expect(issuedAt([])).toBeNull();
});

test("it says the asset is bound to its wallet and shows the issue date", () => {
  const view = render(<SoulboundCard history={[event("mint", "2026-10-12T12:00:00Z")]} />);
  expect(view.getByText("Soulbound")).toBeTruthy();
  expect(view.getByText("Permanently bound to the wallet it was issued to.")).toBeTruthy();
  expect(view.getByText("Issued Oct 12, 2026")).toBeTruthy();
});

test("without history it shows no issue date", () => {
  const view = render(<SoulboundCard />);
  expect(view.getByText("Soulbound")).toBeTruthy();
  expect(view.queryByText(/Issued/)).toBeNull();
});
