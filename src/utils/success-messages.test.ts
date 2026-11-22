import { expect, test } from "bun:test";
import { successMessages } from "./success-messages.js";
import { makeT } from "../i18n/make-t.js";

test("each marketplace message names the asset", () => {
  expect(successMessages.listed({ name: "GO 01", price: "5 STRK" })).toEqual({
    title: "Listing created",
    description: "GO 01 is listed for 5 STRK.",
  });
  expect(successMessages.accepted({ name: "GO 01", price: "5 STRK" }).description).toContain("sold for 5 STRK");
  expect(successMessages.transferred({ name: "GO 01", to: "0x12…ab" }).description).toBe("GO 01 is owned by 0x12…ab.");
  expect(successMessages.cancelled({ kind: "listing" }).title).toBe("Listing cancelled");
  expect(successMessages.cancelled({ kind: "offer" }).title).toBe("Offer cancelled");
});

test("a purchase says how many editions the wallet owns", () => {
  expect(successMessages.purchased({ name: "GO 01", quantity: 1 }).description).toBe("GO 01 is yours.");
  expect(successMessages.purchased({ name: "GO 01", quantity: 3 }).description).toContain("3 editions of GO 01");
});

test("publishing participants says the list is recorded and each one claims with a link", () => {
  expect(successMessages.participantsPublished({ count: 1 }).description).toBe("The list of 1 participant is recorded onchain.");
  expect(successMessages.participantsPublished({ count: 3 }).description).toContain("3 participants");
});

test("wallet, transfer and license messages name what happened", () => {
  expect(successMessages.walletActivated().title).toBe("Wallet activated");
  expect(successMessages.sent({ amount: "5", symbol: "STRK", to: "0x12…ab" }).description).toBe("5 STRK sent to 0x12…ab.");
  expect(successMessages.licenseGranted({ price: "10 STRK" }).description).toContain("listed for 10 STRK");
});

test("a message uses the t it is given, including plural forms", () => {
  const messages = {
    "Listing created": "Anúncio criado",
    "{name} is listed for {price}.": "{name} está à venda por {price}.",
    "The list of {count} participant is recorded onchain.": { one: "A lista de {count} participante está registada.", other: "A lista de {count} participantes está registada." },
  };
  const t = makeT("pt", messages);
  expect(successMessages.listed({ name: "GO 01", price: "5 STRK" }, t)).toEqual({ title: "Anúncio criado", description: "GO 01 está à venda por 5 STRK." });
  expect(successMessages.participantsPublished({ count: 2 }, t).description).toBe("A lista de 2 participantes está registada.");
});
