import { test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DropPreviewCard } from "./drop-preview-card.js";

test("shows placeholder name and zero supply before anything is filled in", () => {
  const html = renderToStaticMarkup(
    <DropPreviewCard
      coverImage={null} name="" symbol="" itemCount={0}
      conditions={null} whitelistEnabled={false} gatedContentEnabled={false}
    />
  );
  expect(html).toContain("Untitled");
});

test("shows the whitelist badge once enabled", () => {
  const html = renderToStaticMarkup(
    <DropPreviewCard
      coverImage={null} name="Genesis" symbol="GEN" itemCount={5}
      conditions={null} whitelistEnabled gatedContentEnabled={false}
    />
  );
  expect(html).toContain("Whitelist");
});

test("shows the exclusive content badge once enabled", () => {
  const html = renderToStaticMarkup(
    <DropPreviewCard
      coverImage={null} name="Genesis" symbol="GEN" itemCount={5}
      conditions={null} whitelistEnabled={false} gatedContentEnabled
    />
  );
  expect(html).toContain("Exclusive content");
});
