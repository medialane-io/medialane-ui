import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "../utils/cn.js";

export interface StepNavStep {
  label: string;

  reachable?: boolean;
}

export interface StepNavProps {

  steps: StepNavStep[];

  current: number;

  onStep?: (step: number) => void;

  accentText?: string;

  accentBg?: string;
  className?: string;
}

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
