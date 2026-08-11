"use client";

import { useMemo } from "react";
import type { MedialaneClient } from "@medialane/sdk/starknet";

export function useMedialaneClient(getClient: () => MedialaneClient): MedialaneClient {
  return useMemo(() => getClient(), [getClient]);
}
