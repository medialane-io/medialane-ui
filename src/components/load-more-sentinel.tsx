"use client";

import { useEffect, useRef } from "react";

export interface LoadMoreSentinelProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export function LoadMoreSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "400px",
}: LoadMoreSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, rootMargin, onLoadMore]);

  if (!hasMore) return null;
  return <div ref={ref} aria-hidden className="h-px w-full" />;
}
