import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";

const { ActionButton } = await import("./action-button.js");

afterEach(() => cleanup());

test("a solid action button uses white text; a soft one uses the foreground colour", () => {
  const { getByText } = render(
    <>
      <ActionButton solid action="buy">Buy now</ActionButton>
      <ActionButton action="offer">Make offer</ActionButton>
    </>,
  );
  expect(getByText("Buy now").className).toContain("text-white");
  expect(getByText("Make offer").className).toContain("text-foreground");
  expect(getByText("Make offer").className).not.toContain("border ");
});
