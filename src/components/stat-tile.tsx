

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
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm ${className ?? ''}`}
    >
      <span className="font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

export interface StatPillRowItem {
  label: string;

  value?: number | string | null;
}

export function StatPillRow({ items, className }: { items: StatPillRowItem[]; className?: string }) {
  const shown = items.filter((i) => i.value !== undefined);
  if (shown.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-0.5 ${className ?? ''}`}>
      {shown.map(({ label, value }) => (
        <StatPill
          key={label}
          label={label}
          value={value == null ? "—" : typeof value === "number" ? value.toLocaleString() : value}
        />
      ))}
    </div>
  );
}
