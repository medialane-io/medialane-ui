import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { PageState, PageStateSkeleton } from "./page-state.js";

afterEach(cleanup);

test("renders the title as the page heading with description and actions", () => {
  const { getByRole, getByText } = render(
    <PageState icon={Wallet} title="Your portfolio" description="Sign in to see it.">
      <button type="button">Sign in</button>
    </PageState>,
  );
  expect(getByRole("heading", { level: 1 }).textContent).toBe("Your portfolio");
  expect(getByText("Sign in to see it.")).toBeTruthy();
  expect(getByRole("button").textContent).toBe("Sign in");
});

test("renders only what is given", () => {
  const { container } = render(<PageState description="Offer not found." />);
  expect(container.querySelector("h1")).toBeNull();
  expect(container.querySelector("svg")).toBeNull();
  expect(container.querySelector("p")?.textContent).toBe("Offer not found.");
});

test("skeleton adds an action placeholder on request", () => {
  const plain = render(<PageStateSkeleton />);
  const count = plain.container.querySelectorAll(".animate-pulse").length;
  cleanup();
  const withAction = render(<PageStateSkeleton action />);
  expect(withAction.container.querySelectorAll(".animate-pulse").length).toBe(count + 1);
});
