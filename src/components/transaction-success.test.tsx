import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { TransactionSuccess } = await import("./transaction-success.js");

const render = (props: Partial<Parameters<typeof TransactionSuccess>[0]> = {}) =>
  renderToStaticMarkup(
    <TransactionSuccess name="Artes Visuais" title="Asset minted" actions={[{ label: "Done", onClick: () => {} }]} {...props} />,
  );

test("leads with the name and image, then says what happened", () => {
  const html = render({ image: "blob:cover", description: "Your wallet is the owner." });
  expect(html).toContain("Artes Visuais");
  expect(html).toContain('data-alt="Artes Visuais"');
  expect(html).toContain("Asset minted");
  expect(html).toContain("Your wallet is the owner.");
});

test("shows every action, links as links and the rest as buttons", () => {
  const html = render({
    actions: [
      { href: "/launchpad/single-editions", label: "Mint an asset" },
      { href: "/collections/starknet/0x1", label: "View collection" },
      { label: "Create another", onClick: () => {} },
    ],
  });
  expect(html).toContain('href="/collections/starknet/0x1"');
  expect(html).toContain("View collection");
  expect(html).toContain("Mint an asset");
  expect(html).toContain("<button");
  expect(html).toContain("Create another");
});

test("leaves out an action it was not given", () => {
  const html = render({ actions: [{ href: "/launchpad/single-editions", label: "Mint an asset" }, undefined] });
  expect(html).not.toContain("View collection");
});

test("links the transaction when it has a hash", () => {
  expect(render({ txHash: "0x1234567890abcdef1234567890abcdef" })).toContain("/tx/0x1234567890abcdef1234567890abcdef");
  expect(render()).not.toContain("/tx/");
});
