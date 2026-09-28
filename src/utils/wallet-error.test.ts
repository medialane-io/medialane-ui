import { test, expect } from "bun:test";
import { isBareExecuteFailure, isUserRejectedRequest } from "./wallet-error";

test("isBareExecuteFailure matches Braavos's bare 'Execute failed' exactly", () => {
  expect(isBareExecuteFailure(new Error("Execute failed"))).toBe(true);
  expect(isBareExecuteFailure(new Error("execute failed"))).toBe(true);
  expect(isBareExecuteFailure(new Error("  Execute failed  "))).toBe(true);
});

test("isBareExecuteFailure does not match an on-chain revert with a reason", () => {
  expect(isBareExecuteFailure(new Error("Execute failed: revert reason foo"))).toBe(false);
});

test("isUserRejectedRequest still returns true for a bare execute failure (unchanged boolean semantics)", () => {
  expect(isUserRejectedRequest(new Error("Execute failed"))).toBe(true);
});
