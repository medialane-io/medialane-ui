import { expect, test, mock, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import type { ApiActivity } from "@medialane/sdk";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { SoulboundCard, issuedAt } = await import("./soulbound-card.js");

afterEach(() => cleanup());

const event = (type: ApiActivity["type"], timestamp: string) => ({ type, timestamp, chain: "STARKNET", txHash: null }) as ApiActivity;

test("the issue date is the earliest mint, ignoring other events", () => {
  expect(issuedAt([event("transfer", "2026-01-01T00:00:00Z"), event("mint", "2026-10-12T12:00:00Z"), event("mint", "2026-10-13T12:00:00Z")])).toBe("Oct 12, 2026");
  expect(issuedAt([event("transfer", "2026-01-01T00:00:00Z")])).toBeNull();
  expect(issuedAt([])).toBeNull();
});

test("it names the asset, links the owner and shows the issue date", () => {
  const view = render(<SoulboundCard image="https://img/a.png" ownerAddress="0x07160000000000000000000000000000000000000000000000000000000cb69" ownerHref="/account/0x0716" history={[event("mint", "2026-10-12T12:00:00Z")]} />);
  expect(view.getByText("Soulbound asset")).toBeTruthy();
  expect(view.getByText("Permanently linked to the wallet it was issued to, verifiable on-chain.")).toBeTruthy();
  expect(view.container.querySelector('a[href="/account/0x0716"]')).toBeTruthy();
  expect(view.getByText("Issued Oct 12, 2026")).toBeTruthy();
});

test("without an owner or history it keeps the title and description only", () => {
  const view = render(<SoulboundCard />);
  expect(view.getByText("Soulbound asset")).toBeTruthy();
  expect(view.container.querySelector("a")).toBeNull();
  expect(view.queryByText(/Issued/)).toBeNull();
});
