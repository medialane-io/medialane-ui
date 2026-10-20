import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AssetOwnersPanel } from "./asset-owners-panel.js";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

const app = { getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
const holders = Array.from({ length: 50 }, (_, i) => ({ owner: "0x" + (i + 1).toString(16), amount: "1" }));
const render = (props: { total?: number; editions?: number } = {}) =>
  renderToStaticMarkup(<MedialaneAppProvider value={app}><AssetOwnersPanel balances={holders} {...props} /></MedialaneAppProvider>);

test("the owners count is the total, not the listed holders", () => {
  const html = render({ total: 1234 });
  expect(html).toContain("1,234 owners");
  expect(html).toContain("+1,229 more owners");
});

test("without a total the listed holders are counted", () => {
  expect(render()).toContain("50 owners");
});

test("editions lead the header when given", () => {
  expect(render({ total: 2, editions: 100 })).toContain("100 editions · 2 owners");
});

test("shows five owners", () => {
  const html = render();
  expect(html).toContain(">0x5<");
  expect(html).not.toContain(">0x6<");
});

test("editions equal to owners are not repeated", () => {
  expect(render({ total: 2, editions: 2 })).not.toContain("editions");
  expect(render({ total: 2, editions: 2 })).toContain("2 owners");
});
