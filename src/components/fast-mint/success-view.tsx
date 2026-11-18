"use client";

import Link from "../link.js";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn.js";
import { Button } from "../button.js";
import { MedialaneCollectionCard } from "../medialane-collection-card.js";
import { RewardEarned } from "../rewards/reward-earned.js";
import type { FormatResult } from "./formats/types.js";
import { useT } from "../../i18n/provider.js";

export interface SuccessViewProps {
  presentation?: "inline" | "dialog";
  previewImage: string | null;
  result: FormatResult;
  onPublishAnother: () => void;
}

export function SuccessView({ presentation = "inline", previewImage, result, onPublishAnother }: SuccessViewProps) {
  const t = useT();
  return (
    <section className={cn(presentation === "dialog" ? "" : "rounded-2xl border border-border p-6 sm:p-8")}>
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6 items-start">
        <MedialaneCollectionCard image={previewImage} name={result.name} collection={result.collectionLabel} />
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-semibold">{result.headline}</p>
            </div>
            <p className="text-sm text-muted-foreground">{result.detail}</p>
          </div>

          {result.links.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5">
              {result.links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          <RewardEarned actionType={result.reward} />

          <Button variant="outline" onClick={onPublishAnother} className="w-full sm:w-auto">
            {t("Publish another")}
          </Button>
        </div>
      </div>
    </section>
  );
}
