import { afterAll, afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { LocaleInfo } from "../i18n/locales.js";

const real = await import("next/navigation");
const pushed: string[] = [];
let path = "/marketplace";
mock.module("next/navigation", () => ({ useRouter: () => ({ push: (href: string) => pushed.push(href) }), usePathname: () => path, useSearchParams: () => new URLSearchParams() }));
afterAll(() => mock.module("next/navigation", () => real));
afterEach(() => {
  cleanup();
  pushed.length = 0;
  document.cookie = "ml_locale=; Path=/; Max-Age=0";
});

const { NavLanguageSwitch } = await import("./nav-language-switch.js");
const { I18nProvider } = await import("../i18n/provider.js");

const locales: LocaleInfo[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "pt", name: "Português", dir: "ltr" },
];

test("choosing pt writes the cookie and navigates to the prefixed path", () => {
  const { getByRole } = render(<NavLanguageSwitch locales={locales} />);
  fireEvent.change(getByRole("combobox"), { target: { value: "pt" } });
  expect(document.cookie).toContain("ml_locale=pt");
  expect(pushed).toEqual(["/pt/marketplace"]);
});

test("choosing en navigates to the unprefixed path and still writes the cookie", () => {
  path = "/pt/marketplace";
  const { getByRole } = render(
    <I18nProvider locale="pt" messages={{}}>
      <NavLanguageSwitch locales={locales} />
    </I18nProvider>,
  );
  expect((getByRole("combobox") as HTMLSelectElement).value).toBe("pt");
  fireEvent.change(getByRole("combobox"), { target: { value: "en" } });
  expect(document.cookie).toContain("ml_locale=en");
  expect(pushed).toEqual(["/marketplace"]);
  path = "/marketplace";
});

test("each language is named in its own language", () => {
  const { getAllByRole } = render(<NavLanguageSwitch locales={locales} />);
  expect(getAllByRole("option").map((option) => option.textContent)).toEqual(["English", "Português"]);
});

test("with one language there is nothing to switch", () => {
  const { container } = render(<NavLanguageSwitch locales={[locales[0]!]} />);
  expect(container.innerHTML).toBe("");
});
