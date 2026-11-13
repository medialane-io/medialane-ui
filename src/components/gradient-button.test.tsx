import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { GradientButton } from "./gradient-button.js";

test("renders its children inside the animated border", () => {
  const html = renderToStaticMarkup(<GradientButton>Sell</GradientButton>);
  expect(html).toContain("btn-border-animated");
  expect(html).toContain("Sell");
});

test("passes the type through", () => {
  expect(renderToStaticMarkup(<GradientButton type="submit">Sell</GradientButton>)).toContain('type="submit"');
});

test("the big size uses the larger radius and height", () => {
  const html = renderToStaticMarkup(<GradientButton big>Mint</GradientButton>);
  expect(html).toContain("rounded-2xl");
  expect(html).toContain("h-[54px]");
});

test("a disabled button is disabled and its border ignores pointer events", () => {
  const html = renderToStaticMarkup(<GradientButton disabled>Sell</GradientButton>);
  expect(html).toContain("disabled");
  expect(html.split("<button")[0]).toContain("pointer-events-none");
});

test("asChild styles the child element instead of rendering a button", () => {
  const html = renderToStaticMarkup(
    <GradientButton asChild>
      <a href="/trade">Trade</a>
    </GradientButton>,
  );
  expect(html).toContain('<a href="/trade"');
  expect(html).not.toContain("<button");
});
