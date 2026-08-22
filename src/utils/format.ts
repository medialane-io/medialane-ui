
export function isStableCurrency(symbol: string | null | undefined): boolean {
  return symbol === "USDC" || symbol === "USDT";
}

export function formatUsd(n: number | null | undefined): string | null {
  if (n == null || !isFinite(n)) return null;
  if (n > 0 && n < 0.01) return "<$0.01";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";

const toSubscript = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUBSCRIPTS[Number(d)])
    .join("");

export function formatSmallDecimal(n: number, significantDigits = 3): string {
  if (!isFinite(n) || n === 0) return "0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  if (abs >= 1) return sign + abs.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (abs >= 0.0001) return sign + abs.toPrecision(significantDigits).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");

  const zeros = -Math.floor(Math.log10(abs)) - 1;
  const digits = abs
    .toExponential(significantDigits - 1)
    .replace(/e[+-]\d+$/, "")
    .replace(".", "")
    .replace(/0+$/, "");

  return `${sign}0.0${toSubscript(zeros)}${digits || "0"}`;
}

export function formatUsdPrice(n: number | null | undefined): string | null {
  if (n == null || !isFinite(n)) return null;
  return `$${formatSmallDecimal(n)}`;
}

function adaptiveDecimals(num: number): number {
  if (num === 0 || num >= 1) return 2;
  if (num >= 0.01) return 4;
  const leadingZeros = Math.floor(-Math.log10(Math.abs(num)));
  return leadingZeros + 2;
}

export function formatDisplayPrice(price: string | number | null | undefined): string {
  if (price === null || price === undefined) return "";
  const priceStr = String(price);
  const parts = priceStr.split(" ");
  const numericPart = parts[0];
  const currencyPart = parts.length > 1 ? parts.slice(1).join(" ") : "";
  const num = Number(numericPart);
  if (isNaN(num)) return priceStr;
  const maxDecimals = adaptiveDecimals(num);
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(2, maxDecimals),
    maximumFractionDigits: maxDecimals,
  });
  return currencyPart ? `${formatted} ${currencyPart}` : formatted;
}

export function parsePriceDisplay(raw: string | null | undefined): { numStr: string; symbol: string | null } {
  if (!raw) return { numStr: "—", symbol: null };
  const parts = raw.trim().split(" ");
  const sym = parts.length > 1 ? parts[parts.length - 1] : null;
  const numericPart = sym ? parts.slice(0, -1).join(" ") : raw;
  const num = Number(numericPart);
  if (isNaN(num)) return { numStr: "—", symbol: sym };
  if (num > 1e12) return { numStr: "—", symbol: null };
  const formatted = formatDisplayPrice(numericPart);
  if (!formatted || formatted === "—") return { numStr: "—", symbol: sym };
  const clean = formatted.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return { numStr: clean || "—", symbol: sym };
}
