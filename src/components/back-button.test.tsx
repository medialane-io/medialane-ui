import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { BackButton } from "./back-button.js";

afterEach(cleanup);

test("with an href it renders a link with the given label", () => {
  const { getByRole } = render(<BackButton href="/launchpad/pop" label="All events" />);
  const link = getByRole("link");
  expect(link.getAttribute("href")).toBe("/launchpad/pop");
  expect(link.textContent).toBe("All events");
});

test("without an href it renders a history button labelled Back", () => {
  const { getByRole } = render(<BackButton />);
  expect(getByRole("button").textContent).toBe("Back");
});
