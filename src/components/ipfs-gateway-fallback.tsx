"use client";

import { useEffect } from "react";
import { DEFAULT_GATEWAY } from "../utils/ipfs.js";
import { gatewayChain, installIpfsGatewayFallback } from "../utils/ipfs-gateway-fallback.js";

/**
 * Mount once per app: IPFS images that fail to load on the app's gateway (`primary`, or the
 * default gateway when none is set) are retried on each public gateway in turn. Renders nothing.
 */
export function IpfsGatewayFallback({ primary }: { primary: string | null | undefined }) {
  const gateway = primary ?? DEFAULT_GATEWAY;
  useEffect(() => installIpfsGatewayFallback(gatewayChain(gateway)), [gateway]);
  return null;
}
