import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { PageHeader, PageHeaderSkeleton } from "./page-header.js";

afterEach(cleanup);

test("renders the title as the page heading", () => {
  const { getByRole } = render(<PageHeader title="Onchain markets" />);
  expect(getByRole("heading", { level: 1 }).textContent).toBe("Onchain markets");
});

test("renders no subtitle, icon or action unless given", () => {
  const { container } = render(<PageHeader title="Search" />);
  expect(container.querySelector("p")).toBeNull();
  expect(container.querySelector("svg")).toBeNull();
  expect(container.querySelectorAll("button")).toHaveLength(0);
});

test("renders subtitle, icon, back, action and extra content in order", () => {
  const { container } = render(
    <PageHeader
      title="Drops"
      subtitle="Timed releases."
      icon={<svg data-testid="icon" />}
      back={<a href="/launchpad">Back</a>}
      action={<button type="button">Create</button>}
    >
      <span>extra</span>
    </PageHeader>,
  );
  const text = container.textContent ?? "";
  expect(text.indexOf("Back")).toBeLessThan(text.indexOf("Drops"));
  expect(text.indexOf("Drops")).toBeLessThan(text.indexOf("Timed releases."));
  expect(text.indexOf("Timed releases.")).toBeLessThan(text.indexOf("Create"));
  expect(text.indexOf("Create")).toBeLessThan(text.indexOf("extra"));
  expect(container.querySelector("[data-testid=icon]")).not.toBeNull();
});

test("the skeleton shows one pill per stat", () => {
  const { container } = render(<PageHeaderSkeleton stats={2} />);
  expect(container.querySelectorAll(".rounded-full")).toHaveLength(2);
});
