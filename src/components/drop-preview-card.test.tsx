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

test("shows mint window open/close dates and max-per-wallet instead of a countdown", () => {
  const html = renderToStaticMarkup(
    <DropPreviewCard
      coverImage={null} name="Genesis" symbol="GEN" itemCount={5}
      conditions={{
        maxSupply: "5", price: "0", paymentToken: "0x0",
        startTime: 1893456000, endTime: 1893542400, maxPerWallet: "2",
      }}
      whitelistEnabled={false} gatedContentEnabled={false}
    />
  );
  expect(html).toContain("Opens:");
  expect(html).toContain("Closes:");
  expect(html).toContain("Max 2/wallet");
  expect(html).not.toContain("HRS");
});
