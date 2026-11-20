import { afterEach, expect, test } from "bun:test";

import { cleanup, render } from "@testing-library/react";
import { QuickAction } from "./quick-action.js";
import { actionFill } from "../action-button.js";
import { ACTION_PAIRS } from "../../data/brand.js";

afterEach(() => cleanup());

test("Send, Receive, Launch, and Activity each use a distinct action fill", () => {
  const fills = (["buy", "offer", "remix", "submit"] as const).map((action) => actionFill(ACTION_PAIRS[action]));
  expect(new Set(fills).size).toBe(4);
});

test("a quick action renders its label as a button", () => {
  const { getByText } = render(<QuickAction label="Send" action="buy" icon={<span />} onClick={() => {}} />);
  expect(getByText("Send").closest("button")).not.toBeNull();
});
