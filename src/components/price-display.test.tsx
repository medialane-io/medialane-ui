import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PriceDisplay } from "./price-display.js";
import { formatCompactPrice } from "../utils/format.js";

const html = (props: Parameters<typeof PriceDisplay>[0]) => renderToStaticMarkup(<PriceDisplay {...props} />);

describe("PriceDisplay", () => {
  test("hero shows the token amount, its name and a labelled USD estimate on one line", () => {
    const out = html({ amountFormatted: "42", currency: "STRK", usdValue: "$1.63", scale: "hero" });
    expect(out).toContain("42.00");
    expect(out).toContain(">STRK<");
    expect(out).toContain("≈ 1.63 USD");
    expect(out).not.toContain("$");
  });

  test("card drops the token name when the icon is shown", () => {
    const out = html({ amountFormatted: "42", currency: "STRK", usdValue: "$1.63", scale: "card" });
    expect(out).toContain("42.00");
    expect(out).not.toContain(">STRK<");
    expect(out).toContain("≈ 1.63 USD");
  });

  test("card keeps the symbol when the token has no icon", () => {
    const out = html({ amountFormatted: "5", currency: "XYZ", scale: "card" });
    expect(out).toContain(">XYZ<");
  });

  test("card shortens large amounts and never wraps", () => {
    const out = html({ amountFormatted: "1200", currency: "STRK", usdValue: "$46.51", scale: "card" });
    expect(out).toContain(">1.2K<");
    expect(out).toContain("whitespace-nowrap");
  });

  test("detail keeps the full amount", () => {
    const out = html({ amountFormatted: "1200", currency: "STRK", scale: "hero" });
    expect(out).toContain("1,200.00");
  });

  test("stablecoins show no USD pill", () => {
    const out = html({ amountFormatted: "1", currency: "USDC", usdValue: "$1.00", scale: "hero" });
    expect(out).toContain("1.00");
    expect(out).not.toContain("USD<");
  });

  test("no USD estimate shows the token price alone", () => {
    const out = html({ amountFormatted: "42", currency: "STRK", scale: "card" });
    expect(out).not.toContain("≈");
  });

  test("a tiny USD estimate has no approximation sign", () => {
    const out = html({ amountFormatted: "0.0001", currency: "STRK", usdValue: "<$0.01", scale: "card" });
    expect(out).toContain("&lt;0.01 USD");
    expect(out).not.toContain("≈");
  });

  test("renders nothing without an amount", () => {
    expect(html({ amountFormatted: null, currency: "STRK", scale: "card" })).toBe("");
  });
});

describe("formatCompactPrice", () => {
  test("shortens from 1,000 and leaves smaller amounts alone", () => {
    expect(formatCompactPrice("999")).toBe("999.00");
    expect(formatCompactPrice("1000")).toBe("1K");
    expect(formatCompactPrice("1599")).toBe("1.6K");
    expect(formatCompactPrice("2500000")).toBe("2.5M");
  });
});
