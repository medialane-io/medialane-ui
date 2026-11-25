import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { loadCatalog } from "../i18n/catalogs.js";
import { I18nProvider } from "../i18n/provider.js";
import { CREATE_ASIDE_KINDS, CreateAside } from "./create-aside.js";

const messages = await loadCatalog("pt");

afterEach(() => cleanup());

test("each create page has its own panel with what's included and the steps", () => {
  expect(CREATE_ASIDE_KINDS).toEqual(["asset", "club", "coin", "collection", "editions", "pop", "tickets", "mintEdition"]);
  for (const kind of CREATE_ASIDE_KINDS) {
    const view = render(<CreateAside kind={kind} />);
    expect(view.container.querySelectorAll("section")).toHaveLength(3);
    expect(view.container.textContent).not.toMatch(/\b(mint|minting|asset|token|nft)s?\b/i);
    cleanup();
  }
});

test("the single work panel speaks of works and publishing", () => {
  const view = render(<CreateAside kind="asset" />);
  expect(view.getByText("A one-of-a-kind work.")).toBeTruthy();
  expect(view.getByText("Publish for free")).toBeTruthy();
});

test("the panel is shown in Portuguese", () => {
  const view = render(<I18nProvider locale="pt" messages={messages}><CreateAside kind="asset" /></I18nProvider>);
  expect(view.getByText("Uma obra única.")).toBeTruthy();
  expect(view.getByText("Publique de graça")).toBeTruthy();
});
