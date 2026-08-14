

export interface StatTileProps {
  label: string;

  value?: string | number | null;

  sub?: string;

  accent?: string;

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
        <span className="text-2xs text-muted-foreground">{sub}</span>
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
      <span className="text-base font-bold text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
