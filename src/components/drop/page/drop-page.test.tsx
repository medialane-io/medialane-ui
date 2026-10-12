import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiDropMint } from "@medialane/sdk";
import { DropActionBox } from "./drop-action-box.js";
import { DropActivityList } from "./drop-activity.js";
import type { ActionBoxView } from "../../../utils/drop/view.js";

const view = (over: Partial<ActionBoxView> = {}): ActionBoxView => ({
  phase: "live", statusText: "Live · no end date", countdown: null, priceText: "5 USDC",
  totalText: "Total 10.1 USDC (incl. platform fee)", eligibility: "Open to everyone",
  button: { label: "Mint 2", action: "mint" }, maxQuantity: 5n, ...over,
});

test("the action box shows status, supply, price, total, eligibility and the button", () => {
  const html = renderToStaticMarkup(
    <DropActionBox view={view()} minted={310n} maxSupply={500n} quantity={2n} onQuantity={() => {}} onAction={() => {}} />,
  );
  for (const text of ["Live · no end date", "310", "500", "5 USDC", "Total 10.1 USDC", "Open to everyone", "Mint 2"]) expect(html).toContain(text);
});

test("a blocked state disables the button and hides the quantity", () => {
  const html = renderToStaticMarkup(
    <DropActionBox view={view({ button: { label: "Sold out", action: "none" }, totalText: null, maxQuantity: 0n })} minted={500n} maxSupply={500n} quantity={1n} onQuantity={() => {}} onAction={() => {}} />,
  );
  expect(html).toContain("Sold out");
  expect(html).toContain("disabled");
  expect(html).not.toContain("Quantity");
});

test("activity lists claims and gifts", () => {
  const mints: ApiDropMint[] = [
    { kind: "claim", wallet: "0x0000000000000000000000000000000000000000000000000000000000000222", quantity: "3", firstTokenId: "1", totalPaid: "0", txHash: "0x1", blockNumber: "1", createdAt: new Date().toISOString() },
    { kind: "issue", wallet: "0x0000000000000000000000000000000000000000000000000000000000000333", quantity: "1", firstTokenId: "4", totalPaid: "0", txHash: "0x2", blockNumber: "2", createdAt: new Date().toISOString() },
  ];
  const html = renderToStaticMarkup(<DropActivityList mints={mints} />);
  expect(html).toContain("minted 3");
  expect(html).toContain("received 1 as a gift");
});
