"use client";

import { Layers, Package, Timer, Users } from "lucide-react";
import { msg } from "../../i18n/translate.js";

import { useT } from "../../i18n/provider.js";
const FEATURES = [
  { icon: Layers, title: msg("Edition or collection"), desc: msg("Numbered copies or unique items.") },
  { icon: Timer, title: msg("Your sale window"), desc: msg("Open and close on any date.") },
  { icon: Users, title: msg("Everyone or a list"), desc: msg("Open to all or by invite.") },
  { icon: Package, title: msg("Collectors own them"), desc: msg("Collectors own every token.") },
];

export function DropFeatures() {
  const t = useT();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="panel relative overflow-hidden p-4 space-y-2">
          <Icon className="h-5 w-5 text-brand-orange" />
          <p className="text-sm font-semibold leading-tight">{t(title)}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t(desc)}</p>
        </div>
      ))}
    </div>
  );
}
