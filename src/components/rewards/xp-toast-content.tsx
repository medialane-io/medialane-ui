export interface XpToastContentProps {
  xp: number;
  /** The action's configured label, e.g. "Mint an IP asset". */
  label: string;
  color?: string;
}

/** Toast body for optimistic XP feedback: "+20 XP · Mint an IP asset".
 *  Scores recompute on a schedule, so this shows the action's configured
 *  value — the caller must never present it as a live balance. */
export function XpToastContent({ xp, label, color = "#8b5cf6" }: XpToastContentProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex h-8 shrink-0 items-center rounded-full border px-2.5 text-sm font-black tabular-nums"
        style={{ borderColor: `${color}60`, backgroundColor: `${color}18`, color }}
      >
        +{xp} XP
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">Counts toward your score soon</p>
      </div>
    </div>
  );
}
