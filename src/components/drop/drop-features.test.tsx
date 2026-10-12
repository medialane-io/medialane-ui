import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropFeatures } from "./drop-features.js";

test("the features strip names both drop kinds and list-only drops", () => {
  const html = renderToStaticMarkup(<DropFeatures />);
  expect(html).toContain("Edition or collection");
  expect(html).toContain("Everyone or a list");
});
