"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks whether the returned ref's element is currently intersecting the
 * viewport. Falls back to "always active" when IntersectionObserver isn't
 * available (matches gol_starknet's own Creature.tsx visibility-gating
 * fallback) rather than defaulting to inactive, which would silently hide
 * content on unsupported browsers.
 */
export function useIntersectionActive<T extends Element>(
  rootMargin = "120px"
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setActive(entry.isIntersecting)),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, active];
}
