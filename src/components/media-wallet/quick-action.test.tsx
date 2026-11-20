import { afterEach, expect, test } from "bun:test";

import { cleanup, render } from "@testing-library/react";
import { QuickAction } from "./quick-action.js";

afterEach(() => cleanup());

test("a quick action renders its label as a button", () => {
  const { getByText } = render(<QuickAction label="Send" icon={<span />} onClick={() => {}} />);
  expect(getByText("Send").closest("button")).not.toBeNull();
});
