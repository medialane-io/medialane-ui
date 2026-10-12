"use client";

import { useState } from "react";
import type { MediaWalletView } from "./types.js";
import { MediaWalletHome } from "./media-wallet-home.js";
import { MediaWalletSend } from "./media-wallet-send.js";
import { MediaWalletTokenDetail } from "./media-wallet-token-detail.js";
import { MediaWalletActivity } from "./media-wallet-activity.js";

export function MediaWallet({
  onClose,
  initialView,
}: {
  onClose: () => void;
  initialView?: MediaWalletView;
}) {
  const [view, setView] = useState<MediaWalletView>(initialView ?? { name: "home" });

  switch (view.name) {
    case "home":
      return <MediaWalletHome onNavigate={setView} onClose={onClose} autoOpenReceive={view.autoOpenReceive} />;
    case "send":
      return <MediaWalletSend initialToken={view.token} onNavigate={setView} onDone={() => setView({ name: "home" })} />;
    case "token":
      return <MediaWalletTokenDetail token={view.token} onNavigate={setView} />;
    case "activity":
      return <MediaWalletActivity onNavigate={setView} />;
  }
}
