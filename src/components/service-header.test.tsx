import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { ServiceHeader } from "./service-header.js";

afterEach(cleanup);

test("a header without a subtitle renders only the title", () => {
  const { container, getByRole } = render(<ServiceHeader icon={<span />} title="Claim your username" />);
  expect(getByRole("heading").textContent).toBe("Claim your username");
  expect(container.querySelector("p")).toBeNull();
});

test("a header with a subtitle renders it under the title", () => {
  const { container } = render(<ServiceHeader icon={<span />} title="Mint" subtitle="One line about it" />);
  expect(container.querySelector("p")?.textContent).toBe("One line about it");
});
