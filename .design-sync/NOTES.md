# Design-sync notes

## Runtime: bun only, no node/npm

This environment has `bun` but no `node`/`npm` binary on PATH. Every script
under `.ds-sync/` and `.design-sync/overrides/` is invoked as `bun <script>.mjs`
instead of `node <script>.mjs` — bun runs .mjs directly and resolves the same
node_modules. Install converter deps with `bun i` instead of `npm i`.

## Re-sync command

```bash
mkdir -p .ds-sync && cp -r <skill-base-dir>/design-sync/{package-build.mjs,package-validate.mjs,package-capture.mjs,resync.mjs,lib,storybook} .ds-sync/
echo '{"name":"ds-sync-deps","private":true}' > .ds-sync/package.json
(cd .ds-sync && bun i esbuild ts-morph @types/react)

bun .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules node_modules \
  --entry ./dist/index.js --out ./ds-bundle
```

The package needs a fresh `bun run build` first (this repo's own dist/, not
an installed copy — `@medialane/ui` isn't self-installed here, hence
`--entry ./dist/index.js`).

**Validate and capture use the forked copies, not the `.ds-sync/` originals**
— they're top-level entry scripts (not a lib module `package-build.mjs`
auto-loads), so invoke them directly from `.design-sync/overrides/`:

```bash
bun .design-sync/overrides/package-validate.mjs ./ds-bundle
bun .design-sync/overrides/package-capture.mjs --out ./ds-bundle [--components A,B]
```

Playwright chromium: check `~/Library/Caches/ms-playwright/` for a cached
build matching `node_modules/playwright-core/browsers.json`'s pinned
revision (this repo pins 1228). If missing: `bun ./node_modules/playwright/cli.js install chromium`
(not `npx playwright install` — no npx here either).

## Forked lib files (`.design-sync/overrides/`, see `cfg.libOverrides`)

- **`bundle.mjs`** — adds a `nextShim` esbuild plugin (same pattern as the
  built-in `reactShim`). Without it, esbuild bundles the REAL `next/link`,
  `next/image`, `next/navigation` modules (this repo has a real `next`
  peer/dev dependency installed), and those read `process.env.__NEXT_*` at
  module-eval time — no `process` global exists in the browser IIFE, so the
  *entire* bundle crashed with `ReferenceError: process is not defined` the
  instant ANY component imported one of them (i.e. always — practically
  every card uses next/link). Stubbed with a plain `<a>`, `<img>`, and
  no-op nav hooks (`usePathname` → `"/"`, `useRouter` → no-op actions).
- **`package-capture.mjs`** / **`package-validate.mjs`** — `settle()` /
  the render-check screenshot path add a 600ms wait + a double
  `requestAnimationFrame` round-trip before every screenshot. Headless
  Chromium can screenshot a same-page `page.goto()` navigation before it has
  actually painted, even though `page.evaluate()` reads correct computed
  styles at that point — the rAF round-trip forces a real paint first.

## Real source bugs found and fixed via this sync (not tooling — shipped to npm)

- `creation-record.tsx` / `portfolio-activity.tsx` had module-scope
  `process.env.NEXT_PUBLIC_EXPLORER_URL` with no `typeof process !== "undefined"`
  guard. Worked fine in the two Next.js apps (webpack/turbopack always
  provide `process.env.NEXT_PUBLIC_*` as literals) but crashes anywhere else
  a consumer's bundler doesn't shim `process` — including this design-sync
  bundle. Fixed at the source (`@medialane/ui@0.127.1`), not worked around
  in the converter.
- `ActionButton`'s `ToneVariants` preview used `tone="indigo"`, no longer a
  valid `ToneKey` (`TONE_GRADIENTS` has blue/purple/orange/red/rose) —
  `TONE_GRADIENTS[tone].join(',')` threw on the undefined lookup. Preview
  fixed to `tone="purple"`; if a real `indigo` tone is wanted back, that's a
  component-source decision for the user, not something to invent here.
- `LaunchpadServiceCard`'s preview used `def('mint-ip-asset')` /
  `def('create-collection')`, keys that no longer exist in
  `LAUNCHPAD_SERVICE_DEFINITIONS` (renamed to `nfts` / `limited-editions`
  at some point) — `.find()!` returned `undefined`, then destructuring
  `{icon}` from it threw. Preview fixed to use current keys.
- `TokenCard`'s preview mocked `activeOrders` as
  `{price, currency, orderId, status}`; the real shape (per
  `token-card.tsx`) is `{offer: {itemType}, price: {formatted, currency}, ...}`.
  Preview fixed to match.

## `.design-sync/base.css` additions

- **Anchor reset** (`a { color: inherit; text-decoration: inherit; }`):
  real apps get this from Tailwind's preflight; this hand-maintained sheet
  doesn't ship preflight, so every `next/link`-wrapped card (AssetCard,
  TokenCard, CollectionCard, ListingCard, …) rendered with the browser's
  default blue/underlined link color instead of the design system's text
  color. Confirmed via computed-style probe (`rgb(0,0,238)` — the classic UA
  `:link` blue) before the fix.

## Known preview limitations

- **CurrencyIcon / MedialaneIcon**: token SVG images don't load in previews
  (broken image paths in the IIFE context — expected, not a bug to fix).
- **next/link stub**: now via the `nextShim` fork above — a plain `<a>`, no
  real router. Blue-link-colored text should NOT appear any more (see the
  anchor reset above); if it does, the reset didn't ship — check
  `.design-sync/base.css` is still `cfg.cssEntry`.
- **Theme**: Claude Design renders in light mode by default (`:root`
  values). Dark mode requires applying `.dark` class to a wrapper — not
  supported in the preview cards.
- **LaunchpadServiceCard capture flake (unresolved, narrow)**: the
  `Featured`/`Grid` stories (the `live` branch, which renders through the
  `<Link>`→`<a>` stub) sometimes screenshot as a solid blank card in
  `package-capture.mjs`'s per-cell → sheet-compositing flow specifically
  when captured as the 2nd/3rd navigation in a sequential same-page loop —
  even with the paint-sync fix above. Confirmed via isolated probes that the
  component itself renders correctly (real content, opacity 1, no
  transform/filter/clip issues) on a single direct navigation — this is
  purely a headless-Chromium repeated-navigation timing artifact in the
  capture tool, not a component or CSS defect. `package-validate.mjs`'s own
  render check (a different, single-navigation-per-component code path)
  does NOT reproduce this and reports both stories clean. Graded `good` off
  validate's render, not the flaky capture sheet. Worth root-causing
  properly in a future session (likely fix: a fresh `page` per story
  instead of reusing one across the loop) but out of scope for what today's
  sync needed.

## Pending grades (deferred, not blocking)

The project's grade cache lives only in `.design-sync/.cache/review/` (gitignored)
and is normally kept warm by the uploaded `_ds_sync.json` anchor. Since this
sync started from an EMPTY remote project (the prior one was deleted — see
below), there was no anchor to carry grades forward from: the 31 previews
authored back in the April sync all came back as ungraded on this pass, not
just the ones this session actually touched.

Graded this session (fixed + verified): ActionButton, TokenCard, Input,
Textarea, Checkbox, Switch, ThemeAmbientBackground. LaunchpadServiceCard's
crash is fixed and its ComingSoon story is graded good; Featured/Grid are
deliberately left ungraded (see the capture-flake note above — visually
confirmed correct via validate's render check, just not through a
grade.json).

The other 28 originally-authored previews (ActionDialog, ActivityCard,
AssetCard, CollectionCard, CoinCard, FeaturedCarousel, HeroSlider,
NavCommandMenu, ServiceFormShell, StatTile, TokenCardSkeleton, etc. — see
`.resync-verdict.json`'s `verification.pendingGrade` for the exact list)
render clean per the mechanical render check (no crashes, no blank/thin
flags) but were never re-graded against the absolute rubric this session —
grading wasn't the point of this pass (it was: sync the recent shadow/
border/consolidation decisions, not a fresh full-DS quality audit). Deferred
to a future session; the components themselves are unaffected and upload
fine either way — grading only affects whether a future re-sync can skip
re-verifying them.

## Lost project

The project this repo was previously pinned to (`1b29ca75-55e7-42eb-977f-39a4add480d7`)
returned 404 (deleted) at the start of this session. Re-pinned to the
user-identified existing "Design System" project
(`019ddfff-5c0c-7505-819f-f4abff094169`), which was empty at re-adoption
time, so this session followed the incremental (fresh-project) upload path.

## Re-sync risks

- The 5 newly-authored previews (Input, Textarea, Checkbox, Switch,
  ThemeAmbientBackground) use minimal, hand-picked demo content — fine for
  now, but if any of these components' real usage patterns are more
  elaborate (e.g. Input with an icon slot, Switch with a label), the preview
  doesn't demonstrate that composition.
- `ThemeAmbientBackground`'s preview wraps the component in a
  `transform: scale(1)` container to contain its `fixed inset-0` layout
  inside the card — this is a preview-only technique; don't copy that
  pattern into real app usage (the component is meant to be a real
  page-level fixed backdrop).
- 121/213 components are still on the floor card (never authored) —
  legitimate per the package shape's default scope (this was a re-sync,
  not a first import), not something this pass needed to clear. Standing
  offer for future incremental authoring.
- `libOverrides` forks (`bundle.mjs`, `package-capture.mjs`,
  `package-validate.mjs`) diverge from `.ds-sync/lib/*` on every re-sync —
  the re-copy step (`cp -r <skill-base-dir>/... .ds-sync/`) does NOT touch
  `.design-sync/overrides/`, so the forks persist, but if the skill's
  upstream `bundle.mjs`/`package-*.mjs` change in a future skill version,
  these forks won't pick up those changes automatically. Diff against the
  freshly-copied `.ds-sync/` versions on the next re-sync and offer to
  merge upstream changes, per the skill's fork-troubleshooting guidance.
