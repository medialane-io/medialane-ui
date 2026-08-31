import { test, expect } from "bun:test";
import { profileIdentity } from "./profile-identity.js";
import { shortenAddress } from "./address.js";

const ADDRESS = "0x057b4f2390e6239194aa04608133e7d6652d31de318d3b7dfcd63db440579fc1";

test("a claimed username is the identity", () => {
  const { identity, name, hasUsername } = profileIdentity({
    username: "devdesign",
    displayName: "Alkera Dev/Design",
    walletAddress: ADDRESS,
  });
  expect(identity).toBe("@devdesign");
  expect(name).toBe("Alkera Dev/Design");
  expect(hasUsername).toBe(true);
});

test("without a username the address identifies the account, never the name", () => {
  const { identity, name, hasUsername } = profileIdentity({
    displayName: "Kimia shayesteh",
    walletAddress: ADDRESS,
  });
  expect(identity).toBe(shorten(ADDRESS));
  expect(name).toBe("Kimia shayesteh");
  expect(hasUsername).toBe(false);
});

test("a name claiming to be the platform does not become the identity", () => {
  // A production profile had displayName "medialane" and no username. The
  // reserved list blocks that as a username; free text went around it.
  const { identity, name } = profileIdentity({
    displayName: "medialane",
    walletAddress: ADDRESS,
  });
  expect(identity).toBe(shorten(ADDRESS));
  expect(identity).not.toContain("medialane");
  expect(name).toBe("medialane");
});

test("a name matching someone else's handle does not borrow the @ prefix", () => {
  const { identity } = profileIdentity({ displayName: "@devdesign", walletAddress: ADDRESS });
  expect(identity).toBe(shorten(ADDRESS));
});

test("blank and whitespace values are treated as absent", () => {
  expect(profileIdentity({ username: "  ", displayName: "", walletAddress: ADDRESS })).toEqual({
    identity: shorten(ADDRESS),
    name: null,
    hasUsername: false,
  });
});

test("an account with nothing at all still renders something", () => {
  expect(profileIdentity({}).identity).toBe("Unknown account");
});

function shorten(a: string) {
  return shortenAddress(a);
}
