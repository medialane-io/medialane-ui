import type { ElementType } from "react";
import { cn } from "../../utils/cn.js";

export interface JourneyStep {
  /** Matches a key in the rewards breakdown (e.g. "mint_asset"). */
  actionType: string;
  label: string;
  href: string;
  icon: ElementType;
}

export interface JourneyPathProps {
  steps: JourneyStep[];
  /** The signed-in user's `rewards.breakdown` — a step is done when its
   *  actionType key is present with a positive value. Pass `{}` (or omit)
   *  for a signed-out visitor — every step renders upcoming. */
  breakdown?: Record<string, number>;
  className?: string;
}

type StepState = "done" | "current" | "upcoming";

function stateFor(step: JourneyStep, index: number, steps: JourneyStep[], breakdown: Record<string, number>): StepState {
  if ((breakdown[step.actionType] ?? 0) > 0) return "done";
  const firstNotDone = steps.findIndex((s) => (breakdown[s.actionType] ?? 0) <= 0);
  return index === firstNotDone ? "current" : "upcoming";
}

/** A permanent, ordered milestone path — no time window, no reset, no
 *  comparison to other users. A step lights up the moment its action has
 *  ever been done and stays lit forever; the first not-yet-done step is
 *  highlighted as "current". Safe to render for a signed-out visitor
 *  (`breakdown` omitted) — every step just renders upcoming, still linkable. */
export function JourneyPath({ steps, breakdown = {}, className }: JourneyPathProps) {
  return (
    <ol className={cn("flex flex-col gap-1", className)}>
      {steps.map((step, i) => {
        const state = stateFor(step, i, steps, breakdown);
        const Icon = step.icon;
        return (
          <li key={step.actionType} className="relative flex items-center gap-3">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px",
                  state === "done" ? "bg-brand-rose/50" : "bg-border"
                )}
              />
            )}
            <a
              href={step.href}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                state === "done" && "border-brand-rose/40 bg-brand-rose/15 text-brand-rose",
                state === "current" && "border-brand-orange/60 bg-brand-orange/10 text-brand-orange",
                state === "upcoming" && "border-border text-muted-foreground/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
            <a
              href={step.href}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors hover:text-foreground",
                state === "upcoming" ? "text-muted-foreground/60" : "text-foreground"
              )}
            >
              {step.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
