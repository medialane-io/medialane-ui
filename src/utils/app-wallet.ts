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

export function createAppWallet(config: AppWalletConfig) {
  const ownerStore = createOwnerStore({ storeKey: config.storeKey, changeEvent: config.changeEvent });

  const passkeyOwner = createPasskeyOwner({
    appName: config.appName,
    relyingPartyName: config.appName,
    relyingPartyId: config.relyingPartyId,
    prfSalt: encode(config.prfSalt),
    hkdfInfo: encode(config.hkdfInfo),
    passkeyUser: async () => {
      const name = config.loadAccountEmail() ?? config.appName;
      return { id: crypto.getRandomValues(new Uint8Array(16)), name, displayName: name };
    },
    knownCredentials: () => [],
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
