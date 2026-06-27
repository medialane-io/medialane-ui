import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface StepNavStep {
  label: string;
  /** Whether the step can be navigated to. Defaults to "any step up to the
   *  current one" when omitted. */
  reachable?: boolean;
}

export interface StepNavProps {
  /** Ordered steps. */
  steps: StepNavStep[];
  /** 1-based index of the active step. */
  current: number;
  /** Called with the 1-based step index when a reachable step is clicked. */
  onStep?: (step: number) => void;
  /** Tailwind text-color class for the active/completed accent (e.g. "text-brand-rose"). */
  accentText?: string;
  /** Tailwind bg-color class for the active dot + completed connector (e.g. "bg-brand-rose"). */
  accentBg?: string;
  className?: string;
}

/** Presentation-only step indicator: a connected row of numbered dots —
 *  solid accent for the active step, an outlined check for completed steps,
 *  muted for upcoming ones, with the connector filling as you progress.
 *  Touch-first (no hover-only affordance); labels collapse on mobile. */
export function StepNav({
  steps,
  current,
  onStep,
  accentText = "text-primary",
  accentBg = "bg-primary",
  className,
}: StepNavProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((s, idx) => {
        const n = idx + 1;
        const done = n < current;
        const active = n === current;
        const reachable = s.reachable ?? n <= current;
        return (
          <Fragment key={s.label}>
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onStep?.(n)}
              aria-current={active ? "step" : undefined}
              className={cn("flex items-center gap-2 shrink-0", reachable ? "cursor-pointer" : "cursor-default")}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  active
                    ? cn(accentBg, "text-white")
                    : done
                      ? cn("border-2 border-current bg-transparent", accentText)
                      : "bg-muted/40 text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              <span
                className={cn(
                  "hidden sm:inline text-xs sm:text-sm font-semibold transition-colors",
                  active ? "text-foreground" : done ? accentText : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <span className={cn("mx-2 sm:mx-3 h-px flex-1 min-w-3 transition-colors", done ? accentBg : "bg-border")} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
