import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { NavLanguageSwitch } from "./nav-language-switch.js";
import { I18nProvider } from "../i18n/provider.js";
import type { LocaleInfo } from "../i18n/locales.js";

afterEach(cleanup);

const router = { push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {}, forward: () => {}, refresh: () => {} };
const locales: LocaleInfo[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "pt", name: "Português", dir: "ltr" },
];

const page = (shown: readonly LocaleInfo[], locale = "en") => (
  <I18nProvider locale={locale} messages={{}}>
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value="/marketplace">
        <NavLanguageSwitch locales={shown} />
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  </I18nProvider>
);

test("each language is named in its own language and the current one is selected", () => {
  const { getAllByRole, getByRole } = render(page(locales, "pt"));
  expect(getAllByRole("option").map((option) => option.textContent)).toEqual(["English", "Português"]);
  expect((getByRole("combobox") as HTMLSelectElement).value).toBe("pt");
});

test("with one language there is nothing to switch", () => {
  const { container } = render(page([locales[0]!]));
  expect(container.innerHTML).toBe("");
});
