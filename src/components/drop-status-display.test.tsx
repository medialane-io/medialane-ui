import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropStatusBadge, DropSupplyProgress, DropPriceDisplay } from "./drop-status-display.js";
import type { DropConditions } from "../utils/drop-status.js";

test("DropStatusBadge renders the live label with a pulse dot", () => {
  const html = renderToStaticMarkup(<DropStatusBadge status="live" />);
  expect(html).toContain("Live");
  expect(html).toContain("animate-pulse");
});

test("DropSupplyProgress shows minted-of-max and a percentage", () => {
  const html = renderToStaticMarkup(<DropSupplyProgress minted={3} max={10} />);
  expect(html).toContain("3");
  expect(html).toContain("of 10");
  expect(html).toContain("30.0%");
});

test("DropPriceDisplay shows Free mint for a zero-price drop", () => {
  const conditions: DropConditions = {
    maxSupply: "10", price: "0", paymentToken: "0x0",
    startTime: 0, endTime: 0, maxPerWallet: "1",
  };
  const html = renderToStaticMarkup(<DropPriceDisplay conditions={conditions} />);
  expect(html).toContain("Free mint");
});
