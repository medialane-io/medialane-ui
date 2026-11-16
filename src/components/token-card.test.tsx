import { afterEach, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiToken } from "@medialane/sdk";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { TokenCard } = await import("./token-card.js");

afterEach(() => cleanup());

const token = (listed: boolean) => ({
  chain: "STARKNET", contractAddress: "0xc1", tokenId: "7", owner: "0xo", standard: "ERC721", metadata: { name: "Loop", image: null },
  activeOrders: listed ? [{ orderHash: "o1", offer: { itemType: "ERC721" }, price: { formatted: "1", currency: "STRK" } }] : [],
}) as unknown as ApiToken;

test("a visitor's card without handlers shows View instead of dead Buy or Offer buttons", () => {
  for (const listed of [false, true]) {
    const html = renderToStaticMarkup(<TokenCard token={token(listed)} />);
    expect(html).not.toContain(">Offer<");
    expect(html).not.toContain(">Buy<");
    expect(html).toContain("View");
  }
});

test("a visitor's card shows Offer and Buy when the app handles them", () => {
  expect(renderToStaticMarkup(<TokenCard token={token(false)} onOffer={() => {}} />)).toContain("Offer");
  expect(renderToStaticMarkup(<TokenCard token={token(true)} onBuy={() => {}} />)).toContain("Buy");
});

const views = (html: string) => (html.match(/View<\/a>/g) ?? []).length;

test("the first button always reads View and is never repeated", () => {
  expect(views(renderToStaticMarkup(<TokenCard token={token(false)} />))).toBe(1);
  expect(views(renderToStaticMarkup(<TokenCard token={token(true)} />))).toBe(1);
  expect(views(renderToStaticMarkup(<TokenCard token={token(true)} isOwner />))).toBe(1);
  expect(views(renderToStaticMarkup(<TokenCard token={token(false)} onOffer={() => {}} />))).toBe(1);
  expect(views(renderToStaticMarkup(<TokenCard token={token(true)} onBuy={() => {}} />))).toBe(1);
  expect(views(renderToStaticMarkup(<TokenCard token={token(false)} isOwner onList={() => {}} />))).toBe(1);
});

function openMenu(node: React.ReactElement) {
  cleanup();
  render(node);
  const trigger = screen.getByLabelText("More actions");
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
}

test("an owner of an ERC721 asset can open the permanent archive action from the menu", async () => {
  const archived: string[] = [];
  openMenu(<TokenCard token={token(false)} isOwner onArchive={(t) => archived.push(t.tokenId)} />);
  const item = await screen.findByText("Permanent archive");
  fireEvent.click(item);
  expect(archived).toEqual(["7"]);
});

test("the archive action is not offered on editions, to visitors, or without a handler", async () => {
  const edition = { ...token(false), standard: "ERC1155" } as ApiToken;
  for (const node of [
    <TokenCard token={edition} isOwner onArchive={() => {}} />,
    <TokenCard token={token(false)} onArchive={() => {}} />,
    <TokenCard token={token(false)} isOwner />,
  ]) {
    openMenu(node);
    await screen.findByText("View asset");
    expect(screen.queryByText("Permanent archive")).toBeNull();
  }
});
