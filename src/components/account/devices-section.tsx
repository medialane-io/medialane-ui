"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Monitor, Plus } from "lucide-react";
import { canRemoveDevice, describeDevices, type DeviceEntry } from "@medialane/sdk/starknet";
import { Button } from "../button.js";
import { Badge } from "../badge.js";
import { describeError } from "../../utils/describe-error.js";
import { DeviceApprovalDialog } from "./device-approval-dialog.js";
import type { DeviceWallet, LoadSealedOwner } from "./wallet-types.js";
import { useT } from "../../i18n/provider.js";

const short = (v: string) => `${v.slice(0, 10)}…${v.slice(-6)}`;

export interface DevicesSectionProps {
  walletAddress: string;
  wallet: DeviceWallet;
  loadSealed: LoadSealedOwner;
}

export function DevicesSection({ walletAddress, wallet, loadSealed }: DevicesSectionProps) {
  const t = useT();
  const [devices, setDevices] = useState<DeviceEntry[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [busyGuid, setBusyGuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const sealed = loadSealed();
    if (!sealed) return;
    wallet
      .getOwners(walletAddress)
      .then((owners) => setDevices(describeDevices(owners, sealed.ownerPubKey)))
      .catch(() => setDevices([]));
  }, [walletAddress, wallet, loadSealed]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRemove = async (device: DeviceEntry) => {
    const sealed = loadSealed();
    if (!sealed || !devices) return;

    const confirmed = window.confirm(
      "Remove this device from the account?",
    );
    if (!confirmed) return;

    setBusyGuid(device.guid);
    setError(null);
    try {
      await wallet.removeDevice(sealed, device.guid);
      refresh();
    } catch (e) {
      setError(describeError(e).message);
    } finally {
      setBusyGuid(null);
    }
  };

  return (
    <div className="panel p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">{t("Your devices")}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("Add a device to use this account elsewhere.")}
          </p>
        </div>
        <Button size="sm" variant="soft" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          {t("Add")}
        </Button>
      </div>

      {devices === null ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : devices.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("No devices found for this account.")}</p>
      ) : (
        <ul className="space-y-2">
          {devices.map((device) => (
            <li
              key={device.guid}
              className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground truncate">
                  {short(device.guid)}
                </span>
                {device.isThisDevice ? <Badge variant="secondary">{t("This device")}</Badge> : null}
              </div>
              {device.isThisDevice ? null : (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!canRemoveDevice(devices, device.guid) || busyGuid !== null}
                  onClick={() => handleRemove(device)}
                >
                  {busyGuid === device.guid ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Remove")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <DeviceApprovalDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onApproved={refresh}
        wallet={wallet}
        loadSealed={loadSealed}
      />
    </div>
  );
}
