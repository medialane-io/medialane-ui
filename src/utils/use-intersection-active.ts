"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

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
