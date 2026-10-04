import type { MediaWallet, SealedOwner } from "@medialane/sdk/starknet";

export type DeviceWallet = Pick<MediaWallet, "getOwners" | "addDevice" | "removeDevice">;

export type GuardianWallet = Pick<MediaWallet, "getGuardians" | "getEscape" | "setFirstGuardian" | "cancelEscape">;

export type LoadSealedOwner = () => SealedOwner | null;
