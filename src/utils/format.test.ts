import { describe, expect, it } from "bun:test";
import { formatSmallDecimal, formatUsdPrice } from "./format.js";

describe("formatSmallDecimal", () => {
  it("compresses leading zeros into a subscript count", () => {
    expect(formatSmallDecimal(2.91e-9)).toBe("0.0₈291");
    expect(formatSmallDecimal(3.77e-7)).toBe("0.0₆377");
    expect(formatSmallDecimal(5.74e-9)).toBe("0.0₈574");
    expect(formatSmallDecimal(1e-12)).toBe("0.0₁₁1");
  });

  it("keeps plain decimals above the subscript threshold", () => {
    expect(formatSmallDecimal(0.000997)).toBe("0.000997");
    expect(formatSmallDecimal(0.0708)).toBe("0.0708");
    expect(formatSmallDecimal(0.0001)).toBe("0.0001");
  });

  it("formats values at or above one with grouped digits", () => {
    expect(formatSmallDecimal(1.5)).toBe("1.5");
    expect(formatSmallDecimal(17.52)).toBe("17.52");
  });

  it("handles zero and non-finite input", () => {
    expect(formatSmallDecimal(0)).toBe("0");
    expect(formatSmallDecimal(Number.NaN)).toBe("0");
    expect(formatSmallDecimal(Number.POSITIVE_INFINITY)).toBe("0");
  });

  it("preserves sign", () => {
    expect(formatSmallDecimal(-2.91e-9)).toBe("-0.0₈291");
  });
});

describe("formatUsdPrice", () => {
  it("renders sub-cent prices instead of clamping them", () => {
    expect(formatUsdPrice(2.91e-9)).toBe("$0.0₈291");
  });

  it("returns null for missing input", () => {
    expect(formatUsdPrice(null)).toBeNull();
    expect(formatUsdPrice(undefined)).toBeNull();
  });
});
