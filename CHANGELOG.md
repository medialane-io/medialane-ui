# Changelog

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
