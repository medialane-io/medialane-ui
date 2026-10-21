# Changelog

## [0.211.2] — 2026-10-21

### Changed

- Asset page: publications and posts use the two-column layout, with the article on the left and the marketplace panel and collection card on the right.

## [0.211.1] — 2026-10-21

### Changed

- Asset page: publications and posts read in one centred column with the platform's text size, the cover as a short banner, and the website beside the byline instead of in the overview.

## [0.211.0] — 2026-10-21

### Added

- Asset page: publications and posts open in a reading layout, with the description as the article and the marketplace panel and collection card beside it.
- `AssetPublicationHeader` and `AssetPublicationText`.

## [0.209.1] — 2026-10-21

### Changed

- Asset page: incoming offers sit on the page without background panels (rows split by a thin divider); the explorer, share and report icons move below the collection card.

## [0.209.0] — 2026-10-21

### Changed

- Asset page: no stats row (Floor, Last sale) and no owner "Listed for" line. Cancel listing carries the listed price, its USD value and the expiry; the collection card shows the collection floor.
- `AssetMarketplacePanel` no longer takes `floorPriceRaw` / `lastSaleRaw`; `AssetCollectionBar` takes `floorPriceRaw`.

### Fixed

- Asset zoom (`AssetLightbox`) is centred and fits the screen; on wide screens it was held to the small dialog width and spilled off the right edge.

## [0.208.0] — 2026-10-21

### Added

- `LicenseRequestPage` — the license request form; it calls `MedialaneApp.ensureSignedIn` (optional; the app's own account sign-in), then sends through the SDK. Signed-out visitors see `SignInPrompt`.
- `MedialaneApp.ensureSignedIn` (optional).

## [0.207.0] — 2026-10-21

### Added

- `CreatorPage` — one page for `/account/[address]` and `/creator/[username]`: profile header, assets (USD values; owner list/transfer/cancel through the app's `useAssetActions`, visitor Buy/Offer through the app's `useMarketActions`), collections, edition and unique listings, analytics, activity, and a More options menu (explorer, share, report).
- `MoreMenu` (shared by the collection and creator pages), `useCreatorByUsername`, and a `CREATOR` report target.

### Changed

- `CreatorHeader` no longer shows the raw wallet address line or its own share button (share is in the More options menu).
- `TokenCard` shows Buy or Offer to visitors only when the page passes `onBuy` / `onOffer`, and View otherwise.

## [0.206.0] — 2026-10-21

### Added

- `LaunchpadPage` (the app passes its quick-mint form; optional `hideGroups` / `excludeKeys`), `RemixBrowsePage`, `ServiceCollectionsPage` (tickets, club), `EditionsPage`, `DropsPage`, `PopMyEventsPage`.
- `SignInPrompt` — a sign-in card with the app's `connectLabel` / `onRequireWallet`.
- `BackButton` — goes back, or to `/launchpad`.

## [0.205.1] — 2026-10-21

### Changed

- Collection header: no "Single NFT" chip on ERC-721 collections; "Multi-edition" stays for ERC-1155.

## [0.205.0] — 2026-10-21

### Changed

- Collection header: no owner buttons for editions and settings, no contract address line.
- Collection tab row: Filters sits at the end of the row (icon only on phones; active filter chips stay above the grid), with a "More options" menu for View on explorer, Share and Report. Tabs start at the left and scroll on phones.
- `CollectionHeader` no longer takes `onReportClick`.

### Added

- `CollectionMoreMenu`, `CollectionActiveFilters`, and `shareOrCopy` (used by `ShareButton` and the menu).

## [0.204.0] — 2026-10-21

### Added

- `RewardsDashboard`, `REWARD_ACTION_LABELS` and `LeaderboardPanel` — rewards sign in through `MedialaneApp`; leaderboard rows show names and avatars and link to profiles.
- `DiscoverPage`, `DiscoverCommunitySection`, `IpTypeNav`, `HomePage` and `CreatorsPage` — the app passes its market actions (Buy) and hero wording.
- `CollectionNameClaim`.
- `orderUsd` — a listing's USD value.

### Changed

- `ActivityRow` links to the configured explorer (`NEXT_PUBLIC_EXPLORER_URL`) by default.
- Tests skip animations; every `next/navigation` test mock provides `useRouter`, `useSearchParams` and `usePathname`.

## [0.203.0] — 2026-10-20

### Added

- `PortfolioShell` and `PORTFOLIO_TABS` — portfolio header, tabs with counts, and a sign-in state that uses the app's `connectLabel` / `onRequireWallet`.
- `PortfolioOrders` — listings, offers sent, offers received and counter-offers; the app passes its own actions (`cancel`, `accept`, `counter`, `dialogs`).
- `PortfolioAssets` — owned assets with USD values; the app passes its own list, transfer and cancel actions.
- `getSeenOffers` / `markOffersAsSeen`.
- `MedialaneApp.walletLoading` (optional) — shows a loading state instead of the sign-in prompt while a wallet reconnects.
- The router module also exports `usePathname`.

### Changed

- Offers received, and their count, come from offers on the owner's tokens (`useReceivedOffers`).
- `derivePortfolioCounts` takes named inputs, including `receivedOffers`.
- Offer senders link to their profile (`profileHref`).

## [0.202.0] — 2026-10-20

### Added

- `NavCommandMenu` `search` prop: typing two or more characters also lists matching creators, collections and assets, plus a row that opens the full search page.
- `useSearch(query, { limit, keepPrevious })` — search reads through SWR.
- `SearchPage` — the full search page; `ResultThumbnail` shared with the menu.
- `createImageResolver`, `useImageUrl` and `MedialaneApp.resolveImage` — components resolve images the way the app configures them (gateway, image proxy).
- `NAV_ITEMS` and `navGroups` — the command menu entries both apps list.
- `matchCommands` — the menu's command ranking, exported.

### Changed

- Profile links use `profileHref` from `@medialane/sdk` (`/creator/<username>`, else `/account/<address>`).
- `ActivityRow`, `ActivityCard` and `ActivityTimelineRow` link assets on the activity's own chain; `getAssetHref` / `getActorHref` props removed (also from `DiscoverFeedSection`).
- `formatActivity` and the notification formatters take an optional image resolver.
- Tests register the DOM once (`bunfig.toml` preload).
- Requires `@medialane/sdk` 0.187.0 (`profileHref`).
## [0.201.10] — 2026-10-20

### Fixed

- `AssetMediaColumn`, `AssetLightbox` and `AnimatedTokenMedia` load images without `crossOrigin`, so images from hosts that send no CORS headers display.

### Changed

- The asset page placeholder is a plain panel, without an icon.

## [0.201.9] — 2026-10-20

### Changed

- `AssetMarketplacePanel` actions sit in a two-column grid; with an odd number the first (Buy, or List for owners) takes the full row.

## [0.201.8] — 2026-10-20

### Changed

- `MediaHeader` image keeps its own shape at full width on phones, like the asset page; square from `sm` up.

## [0.201.7] — 2026-10-20

### Changed

- `MediaHeader` image is full width on phones, small from `sm` up.
- `CollectionHeader` and `CreatorHeader` show the external link, share and report icons after the details instead of in the top row.

## [0.201.6] — 2026-10-20

### Changed

- Ticket and membership panels show dates as a plain range (`From …`, `Until …`); ticket status reads `Upcoming`, `Happening now` or `Ended`, with no status when there are no dates; membership holder line reads `Starts soon` or `Ended`.

## [0.201.5] — 2026-10-20

### Removed

- Quantity and royalty from the ticket and membership panels on `AssetPage`.

## [0.201.4] — 2026-10-20

### Changed

- `AssetOwnersPanel` shows the editions count only when it differs from the owner count.

### Removed

- `AssetMarketplacePanel` no-derivatives note.

## [0.201.3] — 2026-10-20

### Removed

- The owners dialog behind `+N more owners`, and `useTokenOwners`. `AssetOwnersPanel` no longer takes `contract` and `tokenId`.

## [0.201.2] — 2026-10-20

### Changed

- `MediaHeader` (`CollectionHeader`, `CreatorHeader`) is centered on large screens (`max-w-5xl`).

## [0.201.1] — 2026-10-20

### Changed

- `MediaHeader` (`CollectionHeader`, `CreatorHeader`): a small square image beside the details instead of a half-width column.
- `AssetMarketplacePanel`: Buy is a standard-size button in the action row, showing the price and USD value; no cart icon.

## [0.201.0] — 2026-10-20

### Added

- `CollectionHeader`: the collection image in one column and its details (type, symbol, name, description, items, holders, floor, volume, creator, contract) in the other. Children render below the details.
- `CreatorHeader`: the creator image in one column and name, username, address, bio, stats and social links in the other. Children render below.
- `MediaHeader`, `HeaderStats`, `HeaderStat`: the shared two-column layout with the page's blurred background, used by both headers.
- `AssetPage`: the asset page for every asset kind (standard, edition, ticket, membership, POP). Loads its data through the ui hooks and `MedialaneApp`; the app passes `slots`: `useMarketActions` (buy, list, offer, transfer, cancel, accept bid and their dialogs), `Comments`, `Report`, `PopBurn`. Also `AssetPageSkeleton`, `detectAssetKind`, `AssetCommentsDialog`, `FloatingCommentsButton`, `PageBackdrop`.
- `useComments`, `useFullTokenData`, `useAssetMarketState`, `assetAttributes`.
- `CollectionPage`: the collection page (header, owner tools, service action, gated content, assets with filters, market listings and offers, provenance, exclusive tab). The app passes `slots`: `useMarketActions` (buy, offer and their dialogs), `useGatedContent`, `ServiceAction`, `TransferOwnership`. Also `canTransferCollectionOwnership`, `CollectionFiltersDialog`, `GatedContentHero`, `GatedContentPanel`, `MakeOfferPicker`, `ListingCardMenu`.
- `MedialaneApp.ReportDialog` (`ReportDialogSlot`, `ReportTarget`): the app's report dialog, used by `AssetPage`, `CollectionPage` and `ListingCardMenu`.
- `useTokenOwners`; `AssetOwnersPanel` opens every owner from `+N more owners`, a page at a time.

### Changed

- `ListingCard` links to the asset with its chain.
- `AssetOwnersPanel` takes `contract` and `tokenId`.
- Peer `@medialane/sdk` `>=0.185.0` (`getTokenOwners`).
- `AssetMarketplacePanel`: a listed asset's price sits in the Buy button (`GradientButton`, with the USD value); the other actions sit in one wrapping row of standard-size buttons; owners see `Listed for …` and signed-out visitors see `Price …` above the sign-in cards. Floor and last sale show whenever known. Reads the wallet from `MedialaneApp`.
- `AssetHeaderBlock` takes `utilities`, shown at the right of the IP type row, so the title and description use the full width, and `badges`, shown beside the IP type.
- Hooks and components read `getClient` from `MedialaneApp` (`MedialaneAppProvider`); they no longer take it as an argument or prop. `MediaWalletAppProps` no longer has `getClient`.
- `ActionButton` and `AssetMarketplacePanel` render `HelpIcon` themselves.

### Removed

- `CollectionHeroBanner`, `CollectionHeroBannerProps`, `CollectionHeroStat`.
- `ActivitiesFeedProps`.
- `AssetMarketplacePanel` `isSignedIn`, `walletAddress`, `renderHelp`; `ActionButton` `renderHelp`.

## [0.200.1] — 2026-10-20

### Added

- `ExpandableText`: three lines, then `Show more` / `Show less` when the text overflows.

### Changed

- `AssetHeaderBlock` description uses `ExpandableText`.

- `AssetOwnersPanel` takes `editions`; the header reads `100 editions · 2 owners`. Shows five owners, then `+N more owners`.

### Removed

- `AssetOwnersPanel` `ownerLabel`, `showAmount`, `maxVisible`.
- `AssetMediaColumn` `stats`, `buildEditionStats`.
- `AssetHeaderBlock` `showMultiEditionBadge`.

## [0.199.0] — 2026-10-20

### Added

- `MedialaneApp.connectDescription` and `MedialaneApp.companion` (`CompanionApp`: title, description, icon, origin), `AssetRef`.

### Changed

- `AssetMarketplacePanel` takes `asset` (chain, contractAddress, tokenId) and renders the signed-out state from `MedialaneApp`: a sign-in card (`connectLabel`, `connectDescription`, `onRequireWallet`) and a link to the asset in the companion app. Signed in, the companion app link stays below the actions.

### Removed

- `AssetMarketplacePanel` `renderAuthAction`.

## [0.197.0] — 2026-10-19

### Changed

- `TokenCard`: profile link from `tokenProfileLink` (`View owner` / `View creator`).

## [0.196.0] — 2026-10-19

### Added

- `MedialaneAppProvider`, `useMedialaneApp`, `MedialaneApp`, `runIntentCalls`.
- `useToken`, `useTokenBalance`, `useTokenHistory`, `useTokensByOwner`, `checkIsOwner`, `queryKeys.tokenBalance`.
- `AssetOwnersPanel`, `AssetUnavailable`, `AssetProvenanceTab`, `ASSET_ACCENTS`.

### Changed

- `DropPage`, `DropCreate`, `MyDrops` read `MedialaneApp` from `MedialaneAppProvider`.
- Peer `@medialane/sdk` `>=0.184.0`.

### Removed

- `DropAppProps`.

## [0.195.0] — 2026-10-19

### Changed

- `CollectionHeroBanner` height `67svh`.

## [0.194.0] — 2026-10-19

### Added

- `setUploadDiagnosticsReporter` and `UploadDiagnostics`. When the upload to the signed URL fails before a response, `uploadFileToIpfs` checks whether the file can still be read and whether the upload host is reachable, retries once with a fresh signed URL and an in-memory copy of the file, and passes the results to the registered reporter. If the retry fails, the thrown error carries the same results as `diagnostics`.

## [0.193.0] — 2026-10-19

### Changed

- `CollectionCard`, `CollectionCardSkeleton`, `MedialaneCollectionCard` and `DiscoverCreatorsStrip` media is square.
- `DropGridSkeleton` matches `DropCard`.

## [0.192.0] — 2026-10-19

### Changed

- `MarketplaceDialogHero` shows the asset as a centered square; `badge` is positioned within the hero.

## [0.191.0] — 2026-10-19

### Changed

- `AssetCard` media is square.

## [0.190.0] — 2026-10-19

### Changed

- `describeError`, `NETWORK_BUSY`.
- `uploadFileToIpfs` throws `UserFacingError`.

### Added

- `CONNECTION_FAILED` and `FILE_UPLOAD_FAILED`.

## [0.189.0] — 2026-10-16

### Changed

- Requires `@medialane/sdk` 0.182.0.
- `MediaWalletAppProps`, `FastMintProps` and `DropAppProps` no longer take `provider`; chain reads go through `getClient().provider`.
- `createAppWallet` takes `getClient` instead of `provider`.
- `useErc20Balance`, `useTokenBalance` and `usePopClaimStatus` take `getClient` as their first argument.
- `readDropState(client, contract, wallet)` and `useDropChain(getClient, contract, wallet)` no longer take a provider.

### Added

- `hasSufficientBalance(rawBalance, requiredHuman, decimals)` in `utils/media-wallet/use-erc20-balance`.

### Removed

- `DropProvider` and the drop module's own `erc20Balance`; use `erc20Balance` from `@medialane/sdk/starknet`.

## [0.188.0] — 2026-10-12

### Changed

- `useDropChain(getClient, provider, contract, wallet)`: the drop's terms and supply come from the backend (`getDropState`); only the wallet's own claims and balance are read from chain. Requires `@medialane/sdk` 0.174.0.

## [0.187.0] — 2026-10-12

### Changed

- `createAppWallet` defaults (`APP_WALLET_DEFAULTS`) use the app gateway paths: `/api/proxy/v1/paymaster/invoke` and `/api/proxy/v1/paymaster/deploy`. Requires `@medialane/sdk` 0.173.0.

## [0.186.0] — 2026-10-12

### Added

- Media Wallet screens (`components/media-wallet`): `MediaWalletOverlay(props: MediaWalletAppProps)` and `useMediaWallet()` (open/close). The app passes its client, provider, wallet, image resolver, explorer URL, email banner and external wallet link, plus hooks the screens call while shown: `useWalletSession`, `useWriteAction`, `useEmailStatus`, `useAccountEmail` and optional `useHeaderIdentity`.
- Media Wallet helpers under `utils/media-wallet`: formatting, wallet activity, activity feed merge, wallet tokens, NFT items, confetti, `runIntentCalls`, `useErc20Balance(provider, …)`, `useTokenBalance(provider, …)`, `useTokensByOwner(getClient, …)`.
- Peer dependencies: `canvas-confetti`, `qrcode-generator`.

## [0.185.0] — 2026-10-12

### Added

- `useDropFee(getClient)`: the platform fee for a mint, read from the backend.
- `DropFeatures`: the drop features strip.

### Changed

- `DropCreate` and `DropPage` read the fee with `useDropFee`; the `feeConfig` prop is removed. `collectorPriceLine` and `actionBoxView` take the fee in basis points.
- `DropPage` loads collection items only for collection drops; `LaunchDialog` builds the allowlist once per list change.
- `DropStatusBadge` and `DropSupplyProgress` moved to `components/drop/drop-status` (same exports).
- Requires `@medialane/sdk` 0.171.0.

## [0.184.0] — 2026-10-11

### Added

- Drop screens: `DropCreate` with `DraftSummary` (edition or collection, sale, list, launch dialog with parallel uploads and retry), `DropPage` (mint box with quantity, mint dialog, About / Items / Activity / License / Manage tabs), `DropListing`, `MyDrops`, `DropCard`, `DropGrid`, `DropTokenLink`, `ExclusiveFields`, `DropActionBox`, `DropActivityList`.
- Hooks `useDrops`, `useMyDrops`, `useDrop`, `useDropMints`, `useDropFile`, `useDropChain`; `claimProofFor`; types `DropAppProps`, `DropSigner`, `DropProvider`, `DropPhase`.

### Changed

- `DropStatusBadge` takes `phase` (`upcoming | live | sold-out | ended`).
- Requires `@medialane/sdk` 0.170.0.

### Removed

- `DropCreateForm`, `dropCreateSchema`, `DropPreviewCard`, `ExclusiveContentSection`, `DropPriceDisplay`, `getDropStatus`, `getDefaultDropSchedule`, `useDropCollections`, `useDropMintStatus`, `useDropInfo`, `useOnChainDropState`.

## [0.183.0] — 2026-10-11

### Changed

- `FastMintSigner.execute(calls, opts?)` accepts intent ids.
- Requires `@medialane/sdk` 0.168.0 for development.

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
