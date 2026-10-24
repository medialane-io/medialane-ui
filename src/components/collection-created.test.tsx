import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { CollectionCreated } = await import("./collection-created.js");

const render = (props: Partial<Parameters<typeof CollectionCreated>[0]> = {}) =>
  renderToStaticMarkup(<CollectionCreated name="Artes Visuais" onCreateAnother={() => {}} {...props} />);

test("leads with the collection name and image", () => {
  const html = render({ image: "blob:cover" });
  expect(html).toContain("Artes Visuais");
  expect(html).toContain('data-alt="Artes Visuais"');
  expect(html).toContain("Your collection is live");
});

test("shows both actions when the collection can be opened and minted into", () => {
  const html = render({ viewHref: "/collections/starknet/0x1", mintHref: "/launchpad/single-editions" });
  expect(html).toContain('href="/collections/starknet/0x1"');
  expect(html).toContain("View collection");
  expect(html).toContain("Mint an asset");
  expect(html).toContain("Create another");
});

test("leaves out an action it has no destination for", () => {
  const html = render({ mintHref: "/launchpad/single-editions" });
  expect(html).not.toContain("View collection");
});
