import { cn } from "../utils/cn.js";
import { useT } from "../i18n/provider.js";
import { msg } from "../i18n/translate.js";

const OPTION_LABELS: Record<string, string> = {
  Allowed: msg("Allowed"),
  "Not Allowed": msg("Not Allowed"),
  "Share-Alike": msg("Share-Alike"),
  "Training Only": msg("Training Only"),
  Required: msg("Required"),
  "Not Required": msg("Not Required"),
  Yes: msg("Yes"),
  No: msg("No"),
  Free: msg("Free"),
  Paid: msg("Paid"),
  Everyone: msg("Everyone"),
  "Wallet list": msg("Wallet list"),
  "At launch": msg("At launch"),
  "Pick a date": msg("Pick a date"),
  "No end": msg("No end"),
  "No limit": msg("No limit"),
  "Set a limit": msg("Set a limit"),
  Edition: msg("Edition"),
  Collection: msg("Collection"),
};

export function ToggleGroup({
  value, options, onChange,
}: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  const t = useT();
  return (
    <div className="flex rounded-2xl overflow-hidden w-full bg-muted/40">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 px-3 py-2 text-sm transition-colors",
            i > 0 && "border-l border-border",
            value === opt
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-background hover:bg-muted text-muted-foreground",
          )}
        >
          {t(OPTION_LABELS[opt] ?? opt)}
        </button>
      ))}
    </div>
  );
}

export function Section({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="panel p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
