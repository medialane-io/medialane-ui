"use client";

import { useEffect } from "react";
import { installIpfsGatewayFallback } from "../utils/ipfs-gateway-fallback.js";

/**
 * Mount once per app: images from the `primary` IPFS gateway that fail to load are retried on
 * `fallback`. Renders nothing; does nothing when `primary` is not set.
 */
export function IpfsGatewayFallback({ primary, fallback }: { primary: string | null | undefined; fallback: string }) {
  useEffect(() => (primary ? installIpfsGatewayFallback(primary, fallback) : undefined), [primary, fallback]);
  return null;
}
