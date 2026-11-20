import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";

const { ActionButton } = await import("./action-button.js");

afterEach(() => cleanup());

test("an action button is flat: brand blue when solid, the ring for Buy, grey otherwise", () => {
  const { getByText } = render(
    <>
      <ActionButton solid>Mint</ActionButton>
      <ActionButton ring>Buy</ActionButton>
      <ActionButton>View</ActionButton>
    </>,
  );
  expect(getByText("Mint").className).toContain("bg-primary");
  expect(getByText("Buy").className).toContain("btn-ring");
  expect(getByText("View").className).toContain("bg-muted");
  for (const label of ["Mint", "Buy", "View"]) {
    expect(getByText(label).getAttribute("style") ?? "").not.toContain("gradient");
  }
});
