"use client";

import { Users } from "lucide-react";
import { Textarea } from "../../textarea.js";
import { Section, ToggleGroup } from "../../create-form-primitives.js";
import { parseAllowlist } from "../../../utils/drop/allowlist.js";
import { FieldError, type SectionProps } from "./artwork-section.js";

export function ListSection({ draft, setDraft, errors }: SectionProps) {
  const parsed = draft.listOnly ? parseAllowlist(draft.allowlist) : null;
  return (
    <Section title="Who can mint" icon={<Users className="h-4 w-4" />}>
      <ToggleGroup value={draft.listOnly ? "A list" : "Everyone"} options={["Everyone", "A list"]} onChange={(v) => setDraft({ listOnly: v === "A list" })} />
      {draft.listOnly && (
        <div className="space-y-2">
          <Textarea rows={6} placeholder="Paste wallet addresses, one per line" value={draft.allowlist} onChange={(e) => setDraft({ allowlist: e.target.value })} />
          <label className="inline-block cursor-pointer text-xs font-semibold text-primary">
            Upload a CSV
            <input type="file" accept=".csv,text/csv,text/plain" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (f) setDraft({ allowlist: await f.text() }); }} />
          </label>
          {parsed && (
            <p className="text-xs text-muted-foreground">
              {parsed.addresses.length} wallet{parsed.addresses.length === 1 ? "" : "s"}
              {parsed.duplicates.length > 0 && ` · ${parsed.duplicates.length} duplicate${parsed.duplicates.length === 1 ? "" : "s"} skipped`}
            </p>
          )}
          <p className="text-xs text-muted-foreground">After launch you get a claim link for each wallet to share.</p>
          <FieldError message={errors.allowlist} />
        </div>
      )}
    </Section>
  );
}
