"use client";

import { Layers, Package, Timer, Users } from "lucide-react";
import { msg } from "../../i18n/translate.js";

const FEATURES = [
  { icon: Layers, title: msg("Edition or collection"), desc: "One artwork in numbered copies, or many unique items." },
  { icon: Timer, title: msg("Your sale window"), desc: "Open now or on a date, close whenever you choose — or never." },
  { icon: Users, title: msg("Everyone or a list"), desc: "Open to all, or only the wallets you invite with claim links." },
  { icon: Package, title: msg("Collectors own them"), desc: "Each token is theirs to keep, sell or trade anywhere." },
];

export function DropFeatures() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="bento-cell p-4 space-y-2">
          <Icon className="h-5 w-5 text-brand-orange" />
          <p className="text-sm font-semibold leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}
