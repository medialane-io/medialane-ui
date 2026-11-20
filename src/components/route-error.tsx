"use client";

import { useEffect } from "react";
import { Button } from "./button.js";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useT } from "../i18n/provider.js";
import { IconTile } from "./icon-tile.js";

function isStaleChunkError(error: Error): boolean {
  return /ChunkLoadError|Loading chunk .* failed|dynamically imported module|Importing a module script failed/i.test(
    `${error.name} ${error.message}`
  );
}

export function RouteError({ error }: { error: Error & { digest?: string } }) {
  const t = useT();
  useEffect(() => {
    console.error(error);

    if (isStaleChunkError(error) && !sessionStorage.getItem("ml_chunk_reload")) {
      sessionStorage.setItem("ml_chunk_reload", "1");
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <IconTile size="lg" destructive>
        <AlertTriangle />
      </IconTile>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("Reload to continue")}</h1>
        {error.digest && (
          <p className="text-2xs text-muted-foreground/60 tabular-nums">{t("Error ID: {digest}", { digest: error.digest })}
          </p>
        )}
      </div>
      <Button onClick={() => window.location.reload()}>
        <RefreshCw className="h-4 w-4 mr-2" />
        {t("Reload")}
      </Button>
    </div>
  );
}
