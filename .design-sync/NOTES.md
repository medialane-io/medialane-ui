# Design-sync notes

## Re-sync command

Always pass `--entry dist/index.js` when running resync from this source repo.
Without it, the script looks for `node_modules/@medialane/ui/package.json` (which
doesn't exist here — the package isn't self-installed).

```bash
node .ds-sync/resync.mjs \
  --config .design-sync/config.json \
  --node-modules node_modules \
  --out ds-bundle \
  --remote ds-bundle/_ds_sync.json \
  --entry dist/index.js
```

After resync, always run patch-bundle to stamp the browser shims and Tailwind utilities:

```bash
node .design-sync/patch-bundle.mjs ds-bundle
```

Then push `_ds_bundle.js`, `_ds_bundle.css`, `_ds_sync.json` to Claude Design project
`1b29ca75-55e7-42eb-977f-39a4add480d7`.

## Known preview limitations

- **CurrencyIcon / MedialaneIcon**: token SVG images don't load in previews (broken
  image paths in the IIFE context — expected, not a bug to fix).
- **next/link stub**: renders as a plain `<a>` tag; blue underlined link text is normal.
- **Tailwind utilities**: `patch-bundle.mjs` must run after every resync — the resync
  itself only writes the base CSS variables, not the utility classes.
- **Theme**: Claude Design renders in light mode by default (`:root` values). Dark mode
  requires applying `.dark` class to a wrapper — not supported in the preview cards.
