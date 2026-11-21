import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Gem } from "lucide-react";
import { ClaimRail } from "./claim-rail.js";

afterEach(() => cleanup());

const included = [{ icon: Gem, title: "A drop page", desc: "Collectors mint from it." }];

test("the rail shows what's included, the steps and the closing note", () => {
  const view = render(<ClaimRail included={included} steps={["One", "Two"]} trustLead="Yours." trust="You own it." />);
  for (const text of ["A drop page", "One", "Two", "Yours.", "You own it."]) expect(view.getByText(text)).toBeTruthy();
});

test("without a closing note the rail ends with the steps", () => {
  const view = render(<ClaimRail included={included} steps={["One"]} />);
  expect(view.getByText("One")).toBeTruthy();
  expect(view.container.querySelectorAll("section")).toHaveLength(2);
});
