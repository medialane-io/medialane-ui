import { describe, expect, test } from "bun:test";
import { handoffHref, readHandoff } from "./launchpad-handoff";

describe("carrying a file and title from Fast Mint to a create page", () => {
  test("each format opens its own create page", () => {
    expect(handoffHref("pop", { name: "Poster", imageUri: "ipfs://abc" }).startsWith("/launchpad/pop/create?")).toBe(true);
    expect(handoffHref("tickets", { name: "Poster", imageUri: "ipfs://abc" }).startsWith("/launchpad/tickets/create?")).toBe(true);
    expect(handoffHref("club", { name: "Poster", imageUri: "ipfs://abc" }).startsWith("/launchpad/club/create?")).toBe(true);
  });

  test("the title and the uploaded image come out the way they went in", () => {
    const href = handoffHref("pop", { name: "Summer Fest & Friends", imageUri: "ipfs://bafy123" });
    expect(readHandoff(href.slice(href.indexOf("?")))).toEqual({ name: "Summer Fest & Friends", imageUri: "ipfs://bafy123" });
  });

  test("an empty title is left out and the image still comes through", () => {
    const href = handoffHref("club", { name: "  ", imageUri: "ipfs://bafy123" });
    expect(readHandoff(href.slice(href.indexOf("?")))).toEqual({ imageUri: "ipfs://bafy123" });
  });

  test("an image address that is not an uploaded file is ignored", () => {
    expect(readHandoff("?image=https://example.com/a.png&name=Hi")).toEqual({ name: "Hi" });
    expect(readHandoff("?image=javascript:alert(1)")).toBeNull();
  });

  test("a page opened without them has nothing to apply", () => {
    expect(readHandoff("")).toBeNull();
    expect(readHandoff("?q=coin")).toBeNull();
  });

  test("a very long title is cut to the name limit", () => {
    expect(readHandoff(`?name=${"a".repeat(400)}`)?.name?.length).toBe(255);
  });
});
