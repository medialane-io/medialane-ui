"use client";

import { useMemo } from "react";
import type { MedialaneClient } from "@medialane/sdk/starknet";
import { useMedialaneApp } from "../components/medialane-app.js";

export function useMedialaneClient(): MedialaneClient {
  const { getClient } = useMedialaneApp();
  return useMemo(() => getClient(), [getClient]);
}
