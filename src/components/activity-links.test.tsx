import { expect, test, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ApiActivity } from "@medialane/sdk";

mock.module("next/image", () => ({ default: ({ alt }: { alt?: string }) => <span data-alt={alt} /> }));

const { ActivityRow } = await import("./activity-row.js");
const { ActivityCard } = await import("./activity-card.js");
const { ActivityTimelineRow } = await import("./activity-timeline-row.js");

const sale = {
  type: "sale",
  chain: "STARKNET",
  nftContract: "0xc",
  nftTokenId: "7",
  offerer: "0xa",
  txHash: null,
  timestamp: new Date().toISOString(),
  token: { name: "Loop", image: null, animationUrl: null },
} as unknown as ApiActivity;

test("activity row links the asset and the actor's profile", () => {
  const html = renderToStaticMarkup(<ActivityRow activity={sale} />);
  expect(html).toContain('href="/asset/starknet/0xc/7"');
  expect(html).toContain('href="/account/0xa"');
});

test("activity card links the asset on its chain", () => {
  expect(renderToStaticMarkup(<ActivityCard activity={sale} />)).toContain('href="/asset/starknet/0xc/7"');
});

test("activity timeline row links the asset on its chain", () => {
  expect(renderToStaticMarkup(<ActivityTimelineRow event={sale} isLast />)).toContain('href="/asset/starknet/0xc/7"');
});

test("an activity without a chain still links on Starknet", () => {
  const noChain = { ...sale, chain: undefined } as unknown as ApiActivity;
  expect(renderToStaticMarkup(<ActivityRow activity={noChain} />)).toContain('href="/asset/starknet/0xc/7"');
  expect(renderToStaticMarkup(<ActivityCard activity={noChain} />)).toContain('href="/asset/starknet/0xc/7"');
  expect(renderToStaticMarkup(<ActivityTimelineRow event={noChain} isLast />)).toContain('href="/asset/starknet/0xc/7"');
});
