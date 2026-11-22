import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiDropMint } from "@medialane/sdk";
import { DropActionBox } from "./drop-action-box.js";
import { DropActivityList } from "./drop-activity.js";
import type { ActionBoxView } from "../../../utils/drop/view.js";

const view = (over: Partial<ActionBoxView> = {}): ActionBoxView => ({
  phase: "live", statusText: { text: "No end date" }, countdown: null, priceText: "5 USDC",
  totalText: { text: "Total {amount} with the platform fee", vars: { amount: "10.1 USDC" } }, eligibility: { text: "Open to everyone" },
  button: { label: { text: "Mint {count}", vars: { count: "2" } }, action: "mint" }, maxQuantity: 5n, ...over,
});

test("the action box shows status, supply, price, total, eligibility and the button", () => {
  const html = renderToStaticMarkup(
    <DropActionBox view={view()} minted={310n} maxSupply={500n} quantity={2n} onQuantity={() => {}} onAction={() => {}} />,
  );
  for (const text of ["No end date", "310", "500", "5 USDC", "Total 10.1 USDC with the platform fee", "Open to everyone", "Mint 2"]) expect(html).toContain(text);
});

test("a blocked state disables the button and hides the quantity", () => {
  const html = renderToStaticMarkup(
    <DropActionBox view={view({ button: { label: { text: "Sold out" }, action: "none" }, totalText: null, maxQuantity: 0n })} minted={500n} maxSupply={500n} quantity={1n} onQuantity={() => {}} onAction={() => {}} />,
  );
  expect(html).toContain("Sold out");
  expect(html).toContain("disabled");
  expect(html).not.toContain("Quantity");
});

test("the action box reads in Portuguese", async () => {
  const { I18nProvider } = await import("../../../i18n/provider.js");
  const { loadCatalog } = await import("../../../i18n/catalogs.js");
  const messages = await loadCatalog("pt");
  const html = renderToStaticMarkup(
    <I18nProvider locale="pt" messages={messages}>
      <DropActionBox view={view()} minted={310n} maxSupply={500n} quantity={2n} onQuantity={() => {}} onAction={() => {}} />
    </I18nProvider>,
  );
  for (const text of ["Sem data de término", "Total 10.1 USDC com a taxa da plataforma", "Aberto a todos", "Emitir 2"]) expect(html).toContain(text);
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
