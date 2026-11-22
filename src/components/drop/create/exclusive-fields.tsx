"use client";

import { Input } from "../../input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select.js";
import { GATED_CONTENT_TYPES } from "../../../data/gated-content-types.js";
import { useT } from "../../../i18n/provider.js";

export interface ExclusiveValue {
  title: string;
  url: string;
  type: string;
}

const TYPES = Object.keys(GATED_CONTENT_TYPES).map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));

export function ExclusiveFields({ value, onChange }: { value: ExclusiveValue; onChange: (v: ExclusiveValue) => void }) {
  const t = useT();
  return (
    <div className="space-y-3">
      <Input placeholder={t("Title")} value={value.title} maxLength={100} onChange={(e) => onChange({ ...value, title: e.target.value })} />
      <Input placeholder={t("https://…")} value={value.url} onChange={(e) => onChange({ ...value, url: e.target.value.trim() })} />
      <p className="text-xs text-muted-foreground">{t("Only holders see this link.")}</p>
      <Select value={value.type} onValueChange={(type) => onChange({ ...value, type })}>
        <SelectTrigger><SelectValue placeholder={t("Kind of content")} /></SelectTrigger>
        <SelectContent>{TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{t(type.label)}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
