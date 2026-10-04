import {
  createMediaWallet,
  createOwnerStore,
  createPasskeyOwner,
  createSelfFundConsent,
  estimateSelfFundedFee,
  sponsoredExecutor,
  type MediaWalletConfig,
} from "@medialane/sdk/starknet";

export interface AppWalletConfig {
  appName: string;
  relyingPartyId: () => string;
  storeKey: string;
  changeEvent: string;
  prfSalt: string;
  hkdfInfo: string;
  provider: MediaWalletConfig["provider"];
  loadAccountEmail: () => string | null;
  backendUrl?: string;
  sponsoredInvokeUrl?: string;
  deployProxyUrl?: string;
}

const encode = (value: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(value) as Uint8Array<ArrayBuffer>;

export async function stableUserId(email: string): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encode(email)));
}

export function decodeCredentialId(id: string): Uint8Array<ArrayBuffer> {
  const binary = atob(id);
  const raw = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) raw[i] = binary.charCodeAt(i);
  return raw;
}

export function createAppWallet(config: AppWalletConfig) {
  const ownerStore = createOwnerStore({ storeKey: config.storeKey, changeEvent: config.changeEvent });

  const passkeyOwner = createPasskeyOwner({
    appName: config.appName,
    relyingPartyName: config.appName,
    relyingPartyId: config.relyingPartyId,
    prfSalt: encode(config.prfSalt),
    hkdfInfo: encode(config.hkdfInfo),
    passkeyUser: async () => {
      const email = config.loadAccountEmail();
      if (!email) {
        return {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: config.appName,
          displayName: config.appName,
        };
      }
      return { id: await stableUserId(email), name: email, displayName: email };
    },
    knownCredentials: () => {
      const id = ownerStore.load()?.credentialId;
      return id ? [{ type: "public-key", id: decodeCredentialId(id) }] : [];
    },
  });

  const walletConsent = createSelfFundConsent((address, calls) =>
    estimateSelfFundedFee(config.provider(), address, calls),
  );

  const mediaWallet = createMediaWallet({
    store: ownerStore,
    passkey: passkeyOwner,
    executor: sponsoredExecutor({
      provider: config.provider,
      proxyUrl: config.sponsoredInvokeUrl ?? "/api/wallet/sponsored-invoke",
      consent: walletConsent,
    }),
    provider: config.provider,
    backendUrl: config.backendUrl ?? "/api/proxy",
    deployProxyUrl: config.deployProxyUrl ?? "/api/wallet/deploy-sponsored",
  });

  return { ownerStore, passkeyOwner, walletConsent, mediaWallet };
}
