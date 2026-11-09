import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { CollectionFiltersBody } from "./collection-filters.js";

afterEach(cleanup);

const LONG = "Cinema, Paramount Pictures, Luta Livre, filmes em cartaz, A Liga de Monstros ".repeat(8).trim();

test("long filter values stay on one line and keep the full text as a tooltip", () => {
  const view = render(
    <CollectionFiltersBody
      sort="recent"
      onSortChange={() => {}}
      traitSections={[{ traitType: "Tags", values: [{ value: LONG, count: 1 }, { value: "Brasil", count: 3 }] }]}
      selected={{}}
      onToggleValue={() => {}}
    />
  );
  const pill = view.getByTitle(LONG);
  expect(pill.className).toContain("max-w-full");
  expect(pill.querySelector("span.truncate")?.textContent).toBe(LONG);
  expect(view.getByTitle("Brasil")).toBeTruthy();
});
