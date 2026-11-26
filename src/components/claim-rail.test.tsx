import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Gem } from "lucide-react";
import { ClaimRail } from "./claim-rail.js";

afterEach(() => cleanup());

const included = [{ icon: Gem, title: "A drop page", desc: "Collectors mint from it." }];

test("the rail shows what's included, then the steps", () => {
  const view = render(<ClaimRail included={included} steps={["One", "Two"]} />);
  for (const text of ["A drop page", "One", "Two"]) expect(view.getByText(text)).toBeTruthy();
  expect(view.container.querySelectorAll("section")).toHaveLength(2);
});

test("without included items the rail shows the steps alone", () => {
  const view = render(<ClaimRail steps={["One"]} />);
  expect(view.getByText("One")).toBeTruthy();
  expect(view.container.querySelectorAll("section")).toHaveLength(1);
});
