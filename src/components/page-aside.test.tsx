import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { loadCatalog } from "../i18n/catalogs.js";
import { I18nProvider } from "../i18n/provider.js";
import { PAGE_ASIDE_KINDS, PageAside } from "./page-aside.js";

const messages = await loadCatalog("pt");

afterEach(() => cleanup());

test("every panel has what's included and the steps", () => {
  for (const kind of PAGE_ASIDE_KINDS) {
    const view = render(<PageAside kind={kind} />);
    expect(view.container.querySelectorAll("section")).toHaveLength(2);
    cleanup();
  }
});

test("the limited edition panel describes copies, license and authorship", () => {
  const view = render(<PageAside kind="mintEdition" />);
  for (const text of ["Copies to collect", "Your license, attached", "Proof of authorship", "Mint, then sell or send your copies"]) {
    expect(view.getByText(text)).toBeTruthy();
  }
});

test("the panel is shown in Portuguese", () => {
  const view = render(<I18nProvider locale="pt" messages={messages}><PageAside kind="mintEdition" /></I18nProvider>);
  expect(view.getByText("Cópias para colecionar")).toBeTruthy();
});
