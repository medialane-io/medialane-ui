import { GlobalRegistrator } from "@happy-dom/global-registrator";
if (!globalThis.document) GlobalRegistrator.register();

import { expect, test } from "bun:test";
import { renderHook, waitFor } from "@testing-library/react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { usePopClaimStatus } from "./use-pop.js";

test("usePopClaimStatus reads the claim through the client's provider", async () => {
  const entrypoints: string[] = [];
  const client = {
    provider: {
      callContract: async ({ entrypoint }: { entrypoint: string }) => {
        entrypoints.push(entrypoint);
        return ["0x1"];
      },
    },
  } as unknown as MedialaneClient;

  const { result } = renderHook(() => usePopClaimStatus(() => client, "0xc0", "0xa0"));

  await waitFor(() => expect(result.current.hasClaimed).not.toBeNull());
  expect(entrypoints).toEqual(["has_claimed"]);
  expect(result.current.hasClaimed).toBe(true);
});
