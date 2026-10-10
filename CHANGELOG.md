# Changelog

## [0.182.0] — 2026-10-10

### Changed

- `describeWalletFailure`: copy for `deployment` and not-yet-deployed notices.

## [0.181.0] — 2026-10-10

### Changed

- `createAppWallet`: `passkeyUser` id is random per registration; `knownCredentials` is empty.

### Removed

- `stableUserId`, `decodeCredentialId`.

## [0.180.0] — 2026-10-09

### Changed

- `describeWalletFailure`: copy for `unsupported-passkey` and `no-passkeys` (PasskeyUnsupportedError).

## [0.179.0] — 2026-10-09

### Changed

- `describeError`: PasskeyUnsupportedError -> describeWalletFailure message.

## [0.178.0] — 2026-10-09

### Added

- `passkeyUnsupportedReason(err)`, `PasskeyUnsupportedReason`.

### Changed

- `describeWalletFailure` maps by error name; `WalletFailureKind` `unsupported-browser` renamed to `unsupported-passkey`.
- Peer `@medialane/sdk` >=0.161.0.

## [0.177.0] — 2026-10-09

### Changed

- `usePopClaimStatus(provider, collection, wallet)` reads `has_claimed` from the collection on chain and returns
  `{ hasClaimed }`. It takes a Starknet provider instead of the API client.
- Requires `@medialane/sdk` 0.159.0 or later.

### Added

- `popClaimedKey`.

## [0.176.0] — 2026-10-04

### Added

- Account components shared by the apps: `DevicesSection`, `DeviceApprovalDialog`, `GuardianRecoverySection`,
  `AddGuardianDialog`, `AccountSection`, `EmailCodeEntry` and `InputOTP`. Each takes the app's media wallet and its
  sealed-owner loader as props, so an app keeps its own passkey identity.
- `useEmailCode`, taking the app's API client, for the six-digit email code step.
- `input-otp` is a peer dependency.

## [0.175.0] — 2026-10-04

### Added

- `createAppWallet`: one factory for an app's wallet client (owner store, passkey owner, self-fund consent and media wallet),
  configured with the app's relying party, PRF salt, HKDF info, store key and proxy paths.
- `describeWalletFailure`, `isPasskeyCancelled` and `detectPasskeySupport`: the passkey and wallet-setup failure messages
  shared by every app.
- `emailCodeReducer` and its helpers for the six-digit email code step.

## [0.174.0] — 2026-10-03

### Changed

- The memecoin claim card is in the Claims group, with the other claims, and the Coins and Claims taglines say so.

## [0.173.0] — 2026-10-03

### Fixed

- The launchpad claim cards show the real addresses: `medialane.io/creator/your-name` for a username and
  `medialane.io/collection/your-collection` for a collection name.

## [0.172.0] — 2026-10-01

### Changed

- `SelfFundConsentDialog`: "Network fee needed" with the fee, the wallet's balance, "Try again later" and "Pay <fee>";
  paying is disabled when the balance does not cover the fee. Needs `@medialane/sdk` 0.144.0.

### Fixed

- `ActionDialog` stays clickable while another modal dialog is open, so its buttons work over a transaction dialog.

## [0.171.0] — 2026-10-01

### Changed

- `ExportKeySection` exports any owner key on the device as a recovery key that carries the wallet address
  (`encodeRecoveryKey`). The `isRecoveryKey` prop is removed. Needs `@medialane/sdk` 0.142.0.

## [0.170.0] — 2026-10-01

### Added

Hooks io and the dapp each kept a copy of, all taking `getClient`:

- Drops: `useDropCollections`, `useMyDrops`, `useDropMintStatus`, `useDropInfo`, `useOnChainDropState`.
- POP: `usePopCollections`, `useMyPopEvents`, `usePopClaimStatus`.
- Sponsorship: offers, offer, bids, proposals, proposal, licenses, pending proposals, deal counts.
- Tickets and clubs: `useMyClubCollections`, `useMyTicketCollections`, `useMembershipList`, `useTicketList`,
  `useMembershipOnchain`, `useTicketOnchain`, `useIsMemberOf`, `predictNextMembershipId(api, contract)`,
  `predictNextTicketId(api, contract)`. Tier lists read the count once instead of probing ids.
- `usePlatformStats`, `useTokensByIpType`, `usePriceMap`, `useCoinPrice`.
- `collectSitemapData(api)`: pages through the backend's per-page caps.

### Changed

- Collection hooks use the SDK's `listCollections`. Requires `@medialane/sdk` 0.138.0.

## [0.169.0] — 2026-10-01

### Changed

The package reaches the backend only through the SDK client.

- `uploadFileToIpfs`, `uploadJsonToIpfs`, `uploadDirectoryToIpfs` and `pinAssetMetadata` take the SDK
  `ApiClient` as their first argument (e.g. `getMedialaneClient().api`).
- `useReceivedOffers` and `useTokenRemixes` take `getClient` instead of an `apiConfig`.
- `RemixesTab` takes `getClient` instead of `apiConfig`.
- `useNotifications(getClient, address)` no longer takes an `apiConfig`.
- Requires `@medialane/sdk` 0.135.0.

### Removed

- `apiFetch`, `ApiError`, `ApiFetchConfig` and `ApiFetchOptions`. Use the SDK client's methods; its errors
  are `MedialaneApiError`.

## [0.168.0] — 2026-09-30

### Removed

- `EmailVerificationGate`, and the `listingRequiresEmailVerification` and `settingsHref` props of
  `AssetMarketplacePanel`. An io account that never verifies its email becomes inactive and is
  refused by the backend, so the panel no longer gates listing on the email itself.

## [0.159.0] — 2026-09-11

### Removed

- `NEXT_PUBLIC_IPFS_GATEWAY`. Pointing images at a dedicated Pinata gateway
  broke every image in both apps: that gateway refuses unauthenticated reads
  even from hosts on its own allowlist, and a browser cannot hold the token it
  wants. The public gateway is the only one a browser can read, so it is the
  only one, and no setting can redirect images away from it.

## [0.158.0] — 2026-09-11

### Removed

- The gateway token option added in 0.157.0. It read a token from a
  `NEXT_PUBLIC_` variable, which places a credential in the browser bundle
  where anyone can read and spend it. A gateway is reached by restricting it to
  the hosts allowed to call it, never by shipping a key to every visitor.
  A test now asserts no gateway URL can carry a token.

## [0.157.0] — 2026-09-11

### Changed

- The IPFS gateway is configuration rather than a constant. Set
  `NEXT_PUBLIC_IPFS_GATEWAY` to a dedicated gateway host and every image
  resolves through it; leave it unset and the public gateway is used as before.
  A dedicated gateway serves a freshly pinned file immediately, which the
  public one does not, and honours the resize parameters, which the public one
  ignores.

## [0.156.0] — 2026-09-11

### Added

- `syncTransaction(txHash)` asks the backend to apply a transaction the moment
  it confirms, rather than waiting for the indexer's next sweep. It answers
  `null` on any failure and gives up after its timeout, so a flow never blocks
  on it.

## [0.155.0] — 2026-09-11

### Fixed

- Uploads reach the backend through each app's `/api/proxy/v1/metadata/*`
  rather than the per-app pinata routes, which no longer exist. FastMint
  uploaded through those routes and had stopped working wherever they were
  removed.
- No upload asks for a wallet signature. The token argument is gone from
  `uploadFileToIpfs` and `uploadJsonToIpfs`, and the proxy holds the API key.

### Added

- `uploadDirectoryToIpfs` and `pinAssetMetadata`, so an app assembles asset
  metadata with the SDK's builder and pins it without keeping its own copy of
  the upload dance.
