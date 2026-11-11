import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { ExportKeySection } from "./export-key-section.js";

afterEach(cleanup);

const sealed = { address: "0x" + "ab".repeat(32) } as never;
const key = "0x" + "12".repeat(16);

test("extra actions sit on the same row as Show recovery key", () => {
  const { getByText } = render(
    <ExportKeySection loadSealed={() => sealed} unlock={async () => key} actions={<a href="/x">More</a>} />,
  );
  expect(getByText("Show recovery key").closest("div")).toBe(getByText("More").closest("div"));
});

test("extra actions stay on the row of the buttons once the key is shown", async () => {
  const { getByText } = render(
    <ExportKeySection loadSealed={() => sealed} unlock={async () => key} actions={<a href="/x">More</a>} />,
  );
  fireEvent.click(getByText("Show recovery key"));
  await waitFor(() => expect(getByText("Copy key")).toBeTruthy());
  expect(getByText("Copy key").closest("div")).toBe(getByText("More").closest("div"));
});

test("without extra actions it shows only its own buttons", () => {
  const { getByText, queryByText } = render(<ExportKeySection loadSealed={() => sealed} unlock={async () => key} />);
  expect(getByText("Show recovery key")).toBeTruthy();
  expect(queryByText("More")).toBeNull();
});
