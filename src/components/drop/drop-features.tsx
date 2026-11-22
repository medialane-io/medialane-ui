"use client";

import { Layers, Package, Timer, Users } from "lucide-react";
import { msg } from "../../i18n/translate.js";

import { useT } from "../../i18n/provider.js";
const FEATURES = [
  { icon: Layers, title: msg("Copies per asset"), desc: msg("One artwork or many, each with its own copies.") },
  { icon: Timer, title: msg("A sale window"), desc: msg("Start and end on any date.") },
  { icon: Users, title: msg("Open or by list"), desc: msg("Everyone or listed wallets only.") },
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
