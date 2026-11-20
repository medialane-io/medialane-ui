"use client";

import { ACTION_FOREGROUNDS, ACTION_PAIRS } from "../../data/brand.js";
import { actionFill } from "../action-button.js";

export function QuickAction({
  label,
  icon,
  action,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  action: keyof typeof ACTION_PAIRS;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center gap-1.5 ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-[15px] transition-transform group-active:scale-95"
        style={{ backgroundImage: actionFill(ACTION_PAIRS[action]), color: ACTION_FOREGROUNDS[action] }}
      >
        {icon}
      </span>
      <span className="text-2xs font-medium text-muted-foreground">{label}</span>
    </button>
  );
}
