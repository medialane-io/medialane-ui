import { expect, test } from "bun:test";
import { Suspense, type ReactElement } from "react";
import { DropDetailPage } from "./drop-detail-page.js";

test("reading the tab from the address sits behind a Suspense boundary, with the drop as fallback", () => {
  const container = DropDetailPage({ contract: "0x1" }) as ReactElement<{ children: ReactElement<{ fallback: ReactElement<{ contract: string }> }> }>;
  const boundary = container.props.children;
  expect(boundary.type).toBe(Suspense);
  expect(boundary.props.fallback.props.contract).toBe("0x1");
});
