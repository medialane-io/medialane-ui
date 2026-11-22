"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { ActionButton } from "../../action-button.js";
import { Button } from "../../button.js";
import { ClaimRouteShell } from "../../claim-route-shell.js";
import { CollectionPanel } from "./collection-panel.js";
import { AssetsPanel } from "./assets-panel.js";
import { SettingsPanel } from "./settings-panel.js";
import { LaunchDialog } from "./launch-dialog.js";
import { firstMissing, validateDropDraft, type DropDraftErrors, type DropPanel } from "../../../utils/drop/draft.js";
import { indexedDbDraftStore, useSavedDraft, type DraftStore } from "../../../utils/drop/draft-store.js";
import { useMedialaneApp } from "../../medialane-app.js";
import { msg } from "../../../i18n/translate.js";
import { useT } from "../../../i18n/provider.js";

export { dropSymbol } from "../../../utils/drop/draft.js";

const CLEAN: DropDraftErrors = { collection: {}, assets: { byId: {} }, settings: {} };

export function DropCreate({ store }: { store?: DraftStore }) {
  const t = useT();
  const app = useMedialaneApp();
  const draftStore = useMemo(() => store ?? indexedDbDraftStore(), [store]);
  const { draft, setDraft, ready, restored, startOver, clearSaved } = useSavedDraft(draftStore);
  const [open, setOpen] = useState<DropPanel | null>("collection");
  const [tried, setTried] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const wallet = app.walletAddress;
  const live = validateDropDraft(draft, Math.floor(Date.now() / 1000));
  const errors = tried ? live : CLEAN;
  const missing = firstMissing(live);
  const toggle = (panel: DropPanel) => () => setOpen(open === panel ? null : panel);
  const panel = { draft, setDraft, errors };

  const launch = () => {
    if (!wallet) return app.onRequireWallet();
    setTried(true);
    if (missing) return setOpen(missing.panel);
    setLaunching(true);
  };

  return (
    <ClaimRouteShell
      icon={<Package className="h-4 w-4 text-white" />}
      title={msg("Collection drop")}
      subtitle={msg("A new collection released for collectors to mint.")}
    >
      {ready && (
        <div className="space-y-3">
          {restored && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-3 text-sm">
              <span>{t("Draft restored")}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => { startOver(); setTried(false); setOpen("collection"); }}>
                {t("Start over")}
              </Button>
            </div>
          )}
          <CollectionPanel {...panel} open={open === "collection"} onToggle={toggle("collection")} />
          <AssetsPanel {...panel} open={open === "assets"} onToggle={toggle("assets")} />
          <SettingsPanel {...panel} open={open === "settings"} onToggle={toggle("settings")} />
          <div className="space-y-3 pt-3">
            <p className="text-center text-xs text-muted-foreground">{t("Fixed at launch: assets, price, dates, supply and the wallet limit.")}</p>
            <ActionButton solid big onClick={launch} className="w-full">
              {!wallet ? app.connectLabel ?? t("Sign in to launch") : missing ? t(missing.message.text, missing.message.vars) : t("Launch drop")}
            </ActionButton>
          </div>
        </div>
      )}
      {launching && (
        <LaunchDialog
          open
          draft={draft}
          onClose={() => {
            setLaunching(false);
            if (!launched) return;
            setLaunched(false);
            setTried(false);
            setOpen("collection");
            startOver();
          }}
          onLaunched={() => { setLaunched(true); void clearSaved(); }}
        />
      )}
    </ClaimRouteShell>
  );
}
