import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropCreate } from "./drop-create.js";

const props = {
  getClient: () => ({ api: {} }) as never,
  provider: {} as never,
  getSigner: () => { throw new Error("not used"); },
  walletAddress: "0x1",
  onRequireWallet: () => {},
};

test("the create page opens on an edition with every section", () => {
  const html = renderToStaticMarkup(<DropCreate {...props} />);
  for (const text of ["Edition", "Collection", "Artwork", "Details", "Sale", "Who can mint", "Exclusive content", "Review and launch", "Untitled drop", "100 copies", "Open to everyone"]) {
    expect(html).toContain(text);
  }
});

test("signed out, the launch button asks to sign in", () => {
  expect(renderToStaticMarkup(<DropCreate {...props} walletAddress={null} />)).toContain("Sign in to launch");
});
