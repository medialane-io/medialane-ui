import { shortenAddress } from "./address.js";

export interface ProfileIdentitySource {
  username?: string | null;
  displayName?: string | null;
  walletAddress?: string | null;
}

export interface ProfileIdentity {
  identity: string;
  name: string | null;
  hasUsername: boolean;
}

/**
 * Splits a profile into what identifies an account and what merely labels it.
 *
 * `identity` only ever comes from a claimed username or the wallet address.
 * Both are governed: a username is unique, charset-restricted, blocked against
 * a reserved list and reviewed before approval; an address is the account
 * itself. `name` is free text the account typed, so it can say anything and
 * cannot identify anyone.
 *
 * Keeping them apart is the point. A profile that set its name to a platform
 * or a rival's handle rendered as that handle everywhere the two were merged.
 */
export function profileIdentity(source: ProfileIdentitySource): ProfileIdentity {
  const username = source.username?.trim() || null;
  const name = source.displayName?.trim() || null;
  const address = source.walletAddress?.trim() || null;

  return {
    identity: username ? `@${username}` : address ? shortenAddress(address) : "Unknown account",
    name,
    hasUsername: Boolean(username),
  };
}
