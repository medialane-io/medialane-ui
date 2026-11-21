"use client";

import { useEffect } from "react";
import { DEFAULT_GATEWAY } from "../utils/ipfs.js";
import { gatewayChain, installIpfsGatewayFallback } from "../utils/ipfs-gateway-fallback.js";

export function IpfsGatewayFallback({ primary }: { primary: string | null | undefined }) {
  const gateway = primary ?? DEFAULT_GATEWAY;
  useEffect(() => installIpfsGatewayFallback(gatewayChain(gateway)), [gateway]);
  return null;
}
