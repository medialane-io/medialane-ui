import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { CollectionTypeChoices, COLLECTION_TYPES, NewCollectionMenu } from "./new-collection-menu.js";
import { EmptyOrError } from "./empty-or-error.js";

afterEach(cleanup);

test("the two collection types point at their own creation pages", () => {
  expect(COLLECTION_TYPES.map((t) => [t.label, t.href])).toEqual([
    ["NFT Collection", "/launchpad/single-editions/collection"],
    ["Limited Edition NFT Collection", "/launchpad/nfteditions/create"],
  ]);
});

test("the choices offer both types as links", () => {
  const { getByText } = render(<CollectionTypeChoices />);
  expect(getByText("NFT Collection").closest("a")?.getAttribute("href")).toBe("/launchpad/single-editions/collection");
  expect(getByText("Limited Edition NFT Collection").closest("a")?.getAttribute("href")).toBe("/launchpad/nfteditions/create");
});

test("the menu opens to both types", async () => {
  const { getByText, findByText } = render(<NewCollectionMenu />);
  fireEvent.keyDown(getByText("New collection"), { key: "Enter" });
  const single = await findByText("NFT Collection");
  await waitFor(() => expect(single.closest("a")?.getAttribute("href")).toBe("/launchpad/single-editions/collection"));
  expect((await findByText("Limited Edition NFT Collection")).closest("a")?.getAttribute("href")).toBe("/launchpad/nfteditions/create");
});

test("an empty list can show its own actions", () => {
  const { getByText } = render(
    <EmptyOrError isLoading={false} isEmpty emptyTitle="No collections yet" emptyActions={<CollectionTypeChoices />}>
      <p>never shown</p>
    </EmptyOrError>,
  );
  expect(getByText("No collections yet")).toBeTruthy();
  expect(getByText("Limited Edition NFT Collection")).toBeTruthy();
});
