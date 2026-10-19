import { describe, expect, test } from "bun:test";
import { tokenProfileLink } from "./token-profile-link.js";

const creatorAttr = [{ trait_type: "Creator", value: "0xc" }];

describe("tokenProfileLink", () => {
  test("a token with an owner links to the owner", () => {
    expect(tokenProfileLink({ owner: "0xo", balances: null, metadata: { attributes: creatorAttr } })).toEqual({ href: "/account/0xo", label: "View owner" });
  });

  test("an owner from balances wins over the token owner field", () => {
    expect(tokenProfileLink({ owner: null, balances: [{ owner: "0xb", amount: "1" }], metadata: { attributes: creatorAttr } })).toEqual({ href: "/account/0xb", label: "View owner" });
  });

  test("an edition without an owner links to its creator", () => {
    expect(tokenProfileLink({ owner: null, balances: null, metadata: { attributes: creatorAttr } })).toEqual({ href: "/account/0xc", label: "View creator" });
  });

  test("no owner and no creator gives no link", () => {
    expect(tokenProfileLink({ owner: null, balances: null, metadata: { attributes: [] } })).toBeNull();
  });
});
