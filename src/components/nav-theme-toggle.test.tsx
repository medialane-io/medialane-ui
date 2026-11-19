import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { NavThemeToggle } from "./nav-theme-toggle.js";

afterEach(cleanup);

const page = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <NavThemeToggle />
  </ThemeProvider>
);

test("in the dark theme the button offers the light theme", () => {
  const { getByRole } = render(page());
  expect(getByRole("button", { name: "Light theme" })).toBeTruthy();
});

test("one press switches the theme and the button offers the way back", () => {
  const { getByRole } = render(page());
  fireEvent.click(getByRole("button", { name: "Light theme" }));
  expect(getByRole("button", { name: "Dark theme" })).toBeTruthy();
});
