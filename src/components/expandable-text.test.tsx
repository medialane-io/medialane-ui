import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ExpandableText } from "./expandable-text.js";

test("renders the text clamped to three lines", () => {
  const html = renderToStaticMarkup(<ExpandableText text="A long description." />);
  expect(html).toContain("A long description.");
  expect(html).toContain("line-clamp-3");
});

test("no toggle before the text is measured", () => {
  expect(renderToStaticMarkup(<ExpandableText text="Short." />)).not.toContain("Show more");
});
