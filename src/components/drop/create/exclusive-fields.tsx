"use client";

import { Input } from "../../input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { GATED_CONTENT_TYPES } from "../../../data/gated-content-types.js";

export interface ExclusiveValue {
  title: string;
  url: string;
  type: string;
}

const TYPES = Object.keys(GATED_CONTENT_TYPES).map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));

/** Content only holders can open: a title, a private link and its kind. */
export function ExclusiveFields({ value, onChange }: { value: ExclusiveValue; onChange: (v: ExclusiveValue) => void }) {
  return (
    <div className="space-y-3">
      <Input placeholder="Title, e.g. Behind-the-scenes footage" value={value.title} maxLength={100} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      <Input placeholder="https://…" value={value.url} onChange={(e) => onChange({ ...value, url: e.target.value.trim() })} />
      <p className="text-xs text-muted-foreground">Only holders see this link. Use a private or unlisted one.</p>
      <Select value={value.type} onValueChange={(type) => onChange({ ...value, type })}>
        <SelectTrigger><SelectValue placeholder="Kind of content" /></SelectTrigger>
        <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
