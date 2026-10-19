import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropCreate } from "./drop-create.js";
import { MedialaneAppProvider, type MedialaneApp } from "../../../utils/app.js";

const app: MedialaneApp = {
  getClient: () => ({ api: {} }) as never,
  getSigner: () => { throw new Error("not used"); },
  walletAddress: "0x1",
  onRequireWallet: () => {},
};

const render = (value: MedialaneApp) => renderToStaticMarkup(<MedialaneAppProvider value={value}><DropCreate /></MedialaneAppProvider>);

test("the create page opens on an edition with every section", () => {
  const html = render(app);
  for (const text of ["Edition", "Collection", "Artwork", "Details", "Sale", "Who can mint", "Exclusive content", "Review and launch", "Untitled drop", "100 copies", "Open to everyone"]) {
    expect(html).toContain(text);
  }
});

test("signed out, the launch button asks to sign in", () => {
  expect(render({ ...app, walletAddress: null })).toContain("Sign in to launch");
});
