"use client";

export function QuickAction({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center gap-1.5 ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-foreground transition-transform group-active:scale-95">
        {icon}
      </span>
      <span className="text-2xs font-medium text-muted-foreground">{label}</span>
    </button>
  );
}
