import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { CancelOrderConfirm } = await import("./cancel-order-confirm.js");

const price = { formatted: "17", currency: "USDC", decimals: 6 };
const props = { name: "Sunrise", image: "blob:a", price, onKeep: () => {}, onConfirm: () => {} };

test("shows the artwork, the price, one line and two choices", () => {
  const html = renderToStaticMarkup(<CancelOrderConfirm variant="listing" {...props} />);
  expect(html).toContain("Sunrise");
  expect(html).toContain("This order will be permanently removed onchain.");
  expect(html).toContain("Keep it");
  expect(html).toContain("Cancel listing");
  expect(html).not.toContain("cannot be undone");
  expect(html).not.toContain("sponsored");
});

test("an offer says cancel offer", () => {
  const html = renderToStaticMarkup(<CancelOrderConfirm variant="offer" {...props} />);
  expect(html).toContain("Cancel offer");
});

test("a failed attempt shows its error", () => {
  const html = renderToStaticMarkup(<CancelOrderConfirm variant="listing" {...props} error="Network unavailable" />);
  expect(html).toContain("Network unavailable");
});
