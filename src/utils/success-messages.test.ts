import { expect, test } from "bun:test";
import { successMessages } from "./success-messages.js";

test("each marketplace message names the asset and says what is recorded", () => {
  expect(successMessages.listed({ name: "GO 01", price: "5 STRK" })).toEqual({
    title: "Listing created",
    description: "GO 01 is listed for 5 STRK. The order is recorded onchain.",
  });
  expect(successMessages.accepted({ name: "GO 01", price: "5 STRK" }).description).toContain("sold for 5 STRK");
  expect(successMessages.transferred({ name: "GO 01", to: "0x12…ab" }).description).toBe("GO 01 is owned by 0x12…ab.");
  expect(successMessages.cancelled({ kind: "listing" }).title).toBe("Listing cancelled");
  expect(successMessages.cancelled({ kind: "offer" }).title).toBe("Offer cancelled");
});

test("a purchase says how many editions the wallet owns", () => {
  expect(successMessages.purchased({ name: "GO 01", quantity: 1 }).description).toBe("GO 01 is owned by your wallet. The sale is recorded onchain.");
  expect(successMessages.purchased({ name: "GO 01", quantity: 3 }).description).toContain("3 editions of GO 01");
});

test("publishing participants says the list is recorded and each one claims with a link", () => {
  expect(successMessages.participantsPublished({ count: 1 }).description).toBe("The list of 1 participant is recorded onchain. Each one claims with their own link.");
  expect(successMessages.participantsPublished({ count: 3 }).description).toContain("3 participants");
});
