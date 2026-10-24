import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { CreationSuccess } = await import("./creation-success.js");

const render = (props: Partial<Parameters<typeof CreationSuccess>[0]> = {}) =>
  renderToStaticMarkup(
    <CreationSuccess name="Artes Visuais" caption="Your collection is live" againLabel="Create another" onAgain={() => {}} {...props} />,
  );

test("leads with the name and image", () => {
  const html = render({ image: "blob:cover" });
  expect(html).toContain("Artes Visuais");
  expect(html).toContain('data-alt="Artes Visuais"');
  expect(html).toContain("Your collection is live");
});

test("shows both actions and the quiet link", () => {
  const html = render({
    primary: { href: "/launchpad/single-editions", label: "Mint an asset" },
    secondary: { href: "/collections/starknet/0x1", label: "View collection" },
  });
  expect(html).toContain('href="/collections/starknet/0x1"');
  expect(html).toContain("View collection");
  expect(html).toContain("Mint an asset");
  expect(html).toContain("Create another");
});

test("leaves out an action it has no destination for", () => {
  const html = render({ primary: { href: "/launchpad/single-editions", label: "Mint an asset" } });
  expect(html).not.toContain("View collection");
});
