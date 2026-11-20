import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";

const { IconTile } = await import("./icon-tile.js");

afterEach(() => cleanup());

test("an icon tile is white on brand blue, red when destructive", () => {
  const { getByText } = render(
    <>
      <IconTile>A</IconTile>
      <IconTile destructive>B</IconTile>
    </>,
  );
  expect(getByText("A").className).toContain("bg-primary");
  expect(getByText("A").className).toContain("text-white");
  expect(getByText("B").className).toContain("bg-destructive");
});

test("an icon tile keeps the logo's rounded-square shape at every size", () => {
  const { getByText } = render(
    <>
      <IconTile size="sm">S</IconTile>
      <IconTile size="lg">L</IconTile>
    </>,
  );
  expect(getByText("S").className).toContain("rounded-xl");
  expect(getByText("L").className).toContain("rounded-2xl");
  expect(getByText("S").className).not.toContain("rounded-full");
});
