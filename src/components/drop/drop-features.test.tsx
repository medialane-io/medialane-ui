import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropFeatures } from "./drop-features.js";

test("the features strip names copies per asset and list-only drops", () => {
  const html = renderToStaticMarkup(<DropFeatures />);
  expect(html).toContain("Copies per asset");
  expect(html).toContain("Open or by list");
});
