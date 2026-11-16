import { expect, test, afterEach } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AccountLoading } from "./page-skeletons.js";

afterEach(cleanup);

test("the account loading screen follows the account page: text header, pill tabs and token cards", () => {
  const { container } = render(<AccountLoading />);
  expect(container.querySelectorAll(".card-base")).toHaveLength(8);
  expect(container.querySelectorAll(".rounded-full.h-9")).toHaveLength(5);
  expect(container.querySelector(".h-48")).toBeNull();
  expect(container.querySelector(".h-\\[88px\\]")).toBeNull();
});
