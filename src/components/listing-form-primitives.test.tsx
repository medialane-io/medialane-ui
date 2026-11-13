import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-alt={alt} />,
}));

const { DurationPicker, ListingAssetSummary } = await import("./marketplace-dialog-primitives.js");

const options = [
  { label: "30 Days", seconds: 2592000 },
  { label: "2 Years", seconds: 63072000 },
];

test("the duration picker lists every option", () => {
  const html = renderToStaticMarkup(<DurationPicker options={options} value={63072000} onChange={() => {}} />);
  expect(html).toContain("2 Years");
  expect(html).toContain("30 Days");
});

test("the asset summary shows the name and image", () => {
  const html = renderToStaticMarkup(<ListingAssetSummary name="Sunrise" image="blob:a" fallbackIcon={null} badge={<span>Multi-edition</span>} />);
  expect(html).toContain("Sunrise");
  expect(html).toContain('data-alt="Sunrise"');
  expect(html).toContain("Multi-edition");
});
