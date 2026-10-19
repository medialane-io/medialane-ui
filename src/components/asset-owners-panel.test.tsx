import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AssetOwnersPanel } from "./asset-owners-panel.js";
import { MedialaneAppProvider, type MedialaneApp } from "./medialane-app.js";

const app = { getClient: () => ({ api: {} }) as never, getSigner: () => { throw new Error("unused"); }, walletAddress: null, onRequireWallet: () => {} } as MedialaneApp;
const holders = Array.from({ length: 50 }, (_, i) => ({ owner: "0x" + (i + 1).toString(16), amount: "1" }));
const render = (total?: number) =>
  renderToStaticMarkup(<MedialaneAppProvider value={app}><AssetOwnersPanel balances={holders} total={total} maxVisible={5} /></MedialaneAppProvider>);

test("the owners count is the total, not the listed holders", () => {
  const html = render(1234);
  expect(html).toContain("1234 owners");
  expect(html).toContain("+1229 more holders");
});

test("without a total the listed holders are counted", () => {
  expect(render()).toContain("50 owners");
});
