// Bento stat tile and header stat pill — the design system's data-display primitives.

export interface StatTileProps {
  label: string;
  /** Shown as the primary value. Pass "—" (em dash) for unknown, never zero. */
  value?: string | number | null;
  /** Secondary line below the value. */
  sub?: string;
  /** Override color for the value text (e.g. brand-blue for positive deltas). */
  accent?: string;
  /** Large 22px value variant. */
  big?: boolean;
  radius?: number;
  children?: React.ReactNode;
  className?: string;
}

export function StatTile({
  label,
  value,
  sub,
  accent,
  big,
  radius = 16,
  children,
  className,
}: StatTileProps) {
  return (
    <div
      className={`bg-muted border border-border flex flex-col gap-1 min-w-0 ${className ?? ''}`}
      style={{ borderRadius: radius, padding: '12px 14px' }}
    >
      <span className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
        {label}
      </span>
      {value != null && (
        <span
          className="font-semibold leading-none tracking-tight tabular-nums"
          style={{
            fontSize: big ? 22 : 16,
            color: accent,
          }}
        >
          {value}
        </span>
      )}
      {sub && (
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      )}
      {children}
    </div>
  );
}

export interface StatPillProps {
  value: string | number;
  label: string;
  className?: string;
}

export function StatPill({ value, label, className }: StatPillProps) {
  return (
    <div
      className={`inline-flex items-baseline gap-2 px-4 py-2 rounded-full bg-muted ${className ?? ''}`}
    >
      <span className="text-[15px] font-bold text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}
