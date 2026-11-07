"use client";

import { useEffect } from "react";
import { fireConfetti } from "./media-wallet/confetti.js";

export function useConfetti(when: boolean) {
  useEffect(() => {
    if (when) fireConfetti();
  }, [when]);
}
