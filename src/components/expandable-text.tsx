"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn.js";

export function ExpandableText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight);
  }, [text]);

  return (
    <div className={className}>
      <p ref={ref} className={cn("text-sm text-muted-foreground leading-relaxed", !expanded && "line-clamp-3")}>
        {text}
      </p>
      {overflows || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
