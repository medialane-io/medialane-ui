import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropStatusBadge, DropSupplyProgress } from "./drop-status.js";

test("DropStatusBadge renders the live label with a pulse dot", () => {
  const html = renderToStaticMarkup(<DropStatusBadge phase="live" />);
  expect(html).toContain("Live");
  expect(html).toContain("animate-pulse");
});

test("DropStatusBadge names a sold-out drop", () => {
  expect(renderToStaticMarkup(<DropStatusBadge phase="sold-out" />)).toContain("Sold out");
});

test("DropSupplyProgress shows minted-of-max and a percentage", () => {
  const html = renderToStaticMarkup(<DropSupplyProgress minted={3} max={10} />);
  expect(html).toContain("3");
  expect(html).toContain("of 10");
  expect(html).toContain("30.0%");
});
