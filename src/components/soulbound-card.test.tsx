import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { profileHref, type ApiActivity } from "@medialane/sdk";
import { shortenAddress } from "../utils/address.js";

const { SoulboundCard, issuedAt } = await import("./soulbound-card.js");

afterEach(() => cleanup());

const event = (type: ApiActivity["type"], timestamp: string) => ({ type, timestamp, chain: "STARKNET", txHash: null }) as ApiActivity;

test("the issue date is the earliest mint, ignoring other events", () => {
  expect(issuedAt([event("transfer", "2026-01-01T00:00:00Z"), event("mint", "2026-10-12T12:00:00Z"), event("mint", "2026-10-13T12:00:00Z")])).toBe("Oct 12, 2026");
  expect(issuedAt([event("transfer", "2026-01-01T00:00:00Z")])).toBeNull();
  expect(issuedAt([])).toBeNull();
});

const OWNER = "0x02bc1234567890abcdef1234567890abcdef1234567890abcdef1234567890dc87";

test("it names the wallet the asset is bound to and shows the issue date", () => {
  const view = render(<SoulboundCard history={[event("mint", "2026-10-12T12:00:00Z")]} ownerAddress={OWNER} />);
  expect(view.getByText("Soulbound")).toBeTruthy();
  const link = view.getByRole("link");
  expect(link.textContent).toBe(shortenAddress(OWNER));
  expect(link.getAttribute("href")).toBe(profileHref({ address: OWNER }));
  expect(view.container.textContent).toContain(`Permanently bound to ${shortenAddress(OWNER)}`);
  expect(view.getByText("Issued")).toBeTruthy();
  expect(view.getByText("Oct 12, 2026")).toBeTruthy();
});

test("without an owner address it keeps the generic line", () => {
  const view = render(<SoulboundCard history={[event("mint", "2026-10-12T12:00:00Z")]} />);
  expect(view.getByText("Permanently bound to the wallet it was issued to.")).toBeTruthy();
  expect(view.queryByRole("link")).toBeNull();
});

test("without history it shows no issue date", () => {
  const view = render(<SoulboundCard />);
  expect(view.getByText("Soulbound")).toBeTruthy();
  expect(view.queryByText(/Issued/)).toBeNull();
});
