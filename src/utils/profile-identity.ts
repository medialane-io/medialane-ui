import { shortenAddress } from "./address.js";

export interface ProfileIdentitySource {
  username?: string | null;
  name?: string | null;
  walletAddress?: string | null;
}

export interface ProfileIdentity {
  identity: string;
  name: string | null;
  hasUsername: boolean;
}

export function profileIdentity(source: ProfileIdentitySource): ProfileIdentity {
  const username = source.username?.trim() || null;
  const name = source.name?.trim() || null;
  const address = source.walletAddress?.trim() || null;

  return {
    identity: username ? `@${username}` : address ? shortenAddress(address) : "Unknown account",
    name,
    hasUsername: Boolean(username),
  };
}
