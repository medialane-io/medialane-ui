import { expect, test } from "bun:test";
import { emptyMessages } from "./empty-messages.js";

test("each empty state says what appears and what fills it", () => {
  for (const message of Object.values(emptyMessages)) {
    expect(message.title.length).toBeGreaterThan(0);
    expect(message.description.endsWith(".")).toBe(true);
  }
  expect(emptyMessages.listings.title).toBe("Listings appear here");
});
