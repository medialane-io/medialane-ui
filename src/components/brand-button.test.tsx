import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandButton } from "./brand-button.js";

test("renders its children inside the animated border", () => {
  const html = renderToStaticMarkup(<BrandButton>Sell</BrandButton>);
  expect(html).toContain("btn-border-animated");
  expect(html).toContain("Sell");
});

test("passes the type through", () => {
  expect(renderToStaticMarkup(<BrandButton type="submit">Sell</BrandButton>)).toContain('type="submit"');
});

test("a disabled button is disabled and its border ignores pointer events", () => {
  const html = renderToStaticMarkup(<BrandButton disabled>Sell</BrandButton>);
  expect(html).toContain("disabled");
  expect(html.split("<button")[0]).toContain("pointer-events-none");
});

test("the large size uses the larger radius and height", () => {
  const html = renderToStaticMarkup(<BrandButton size="lg">Mint</BrandButton>);
  expect(html).toContain("rounded-2xl");
  expect(html).toContain("h-12");
});

test("asChild styles the child element instead of rendering a button", () => {
  const html = renderToStaticMarkup(
    <BrandButton asChild>
      <a href="/trade">Trade</a>
    </BrandButton>,
  );
  expect(html).toContain('<a href="/trade"');
  expect(html).not.toContain("<button");
});
