import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { OrderSummaryHero } = await import("./marketplace-dialog-primitives.js");

const price = { formatted: "2.5", currency: "STRK", decimals: 18 };

test("shows the name, the subtitle and the price", () => {
  const html = renderToStaticMarkup(<OrderSummaryHero name="Sunrise" image="blob:a" subtitle="Cancel listing" price={price} />);
  expect(html).toContain("Sunrise");
  expect(html).toContain('data-alt="Sunrise"');
  expect(html).toContain("Cancel listing");
  expect(html).toContain("2.50");
  expect(html).toContain("STRK");
});

test("leads with the dollar value when one is given", () => {
  const html = renderToStaticMarkup(<OrderSummaryHero name="Sunrise" subtitle="Buy" price={price} usdTotal="$1.25" />);
  expect(html).toContain("$1.25");
  expect(html).toContain("2.50 STRK");
});

test("a stable currency is not repeated next to its dollar value", () => {
  const html = renderToStaticMarkup(
    <OrderSummaryHero name="Sunrise" subtitle="Buy" price={{ formatted: "10", currency: "USDC", decimals: 6 }} usdTotal="$10.00" />,
  );
  expect(html).not.toContain("10 USDC");
});

test("a quantity above one shows the total and the unit price", () => {
  const html = renderToStaticMarkup(<OrderSummaryHero name="Sunrise" subtitle="Buy" price={price} quantity={3} />);
  expect(html).toContain("7.50");
  expect(html).toContain("2.50 × 3 STRK");
});

test("renders without a price", () => {
  const html = renderToStaticMarkup(<OrderSummaryHero name="Sunrise" subtitle="Cancel offer" tone="destructive" />);
  expect(html).toContain("Sunrise");
  expect(html).not.toContain("STRK");
});
