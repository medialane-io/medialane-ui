import {
  createMediaWallet,
  createOwnerStore,
  createPasskeyOwner,
  createSelfFundConsent,
  estimateSelfFundedFee,
  sponsoredExecutor,
  type MedialaneClient,
} from "@medialane/sdk/starknet";

export interface AppWalletConfig {
  appName: string;
  relyingPartyId: () => string;
  storeKey: string;
  changeEvent: string;
  prfSalt: string;
  hkdfInfo: string;
  getClient: () => MedialaneClient;
  loadAccountEmail: () => string | null;
  backendUrl?: string;
  sponsoredInvokeUrl?: string;
  deployProxyUrl?: string;
}

const encode = (value: string): Uint8Array<ArrayBuffer> => new TextEncoder().encode(value) as Uint8Array<ArrayBuffer>;

export const APP_WALLET_DEFAULTS = {
  backendUrl: "/api/proxy",
  sponsoredInvokeUrl: "/api/proxy/v1/paymaster/invoke",
  deployProxyUrl: "/api/proxy/v1/paymaster/deploy",
} as const;

export function createAppWallet(config: AppWalletConfig) {
  const provider = () => config.getClient().provider;
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
    estimateSelfFundedFee(provider(), address, calls),
  );

  const mediaWallet = createMediaWallet({
    store: ownerStore,
    passkey: passkeyOwner,
    executor: sponsoredExecutor({
      provider,
      proxyUrl: config.sponsoredInvokeUrl ?? APP_WALLET_DEFAULTS.sponsoredInvokeUrl,
      consent: walletConsent,
    }),
    provider,
    backendUrl: config.backendUrl ?? APP_WALLET_DEFAULTS.backendUrl,
    deployProxyUrl: config.deployProxyUrl ?? APP_WALLET_DEFAULTS.deployProxyUrl,
  });

  return { ownerStore, passkeyOwner, walletConsent, mediaWallet };
}
