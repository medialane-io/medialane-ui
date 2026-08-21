## Medialane UI — building conventions

**No top-level provider needed.** All 213 components render standalone —
no ThemeProvider/context wrapper required to get correct styling. Just
import from `@medialane/ui` and use directly.

**Styling idiom: Tailwind utility classes, driven by CSS custom-property
tokens.** Every component is styled with Tailwind utilities (`className`),
never inline styles or CSS-in-JS, and the utilities resolve through this
design system's own HSL tokens (not Tailwind's default palette):

| Token | Utility examples | Use for |
|---|---|---|
| `--background` / `--foreground` | `bg-background`, `text-foreground` | page canvas, primary text |
| `--card` / `--card-foreground` | `bg-card`, `text-card-foreground` | card/panel surfaces |
| `--primary` / `--primary-foreground` | `bg-primary`, `text-primary-foreground` | primary actions |
| `--secondary`, `--muted`, `--accent` (+ `-foreground`) | `bg-muted`, `text-muted-foreground` | secondary UI, subdued text |
| `--destructive` (+ `-foreground`) | `text-destructive`, `bg-destructive` | errors, delete/burn actions |
| `--border` / `--input` / `--ring` | `border-border`, `border-input` | hairline borders, focus rings |
| `--brand-blue`, `--brand-purple`, `--brand-rose`, `--brand-orange` | `text-brand-purple`, `bg-brand-blue/10` | brand accents, category tints |
| `--price` | — | price display accent |
| `--radius` | `rounded-lg`, `rounded-2xl`, `rounded-[calc(var(--radius)*1.25)]` | corner radii scale off this one var |

Compose with `cn(...)` (a `clsx`/`tailwind-merge` helper, exported from the
package) to merge conditional classes — every component's own `className`
prop is designed to be overridden this way, not fought.

**Cards are hairline, never shadowed.** The whole card family (AssetCard,
TokenCard, CollectionCard, ListingCard, CoinCard, the base Card primitive)
uses a 1px `border-border` hairline and NO box-shadow — this is a
deliberate, repo-wide aesthetic decision, not an oversight. Don't add
`shadow-*` to a card composition. The same rule extends to floating
surfaces (Dialog, Sheet, Popover, DropdownMenu, the wallet account panel,
the nav command menu): they sit above a `backdrop-blur` overlay and
deliberately carry no border or shadow either, letting the panel blend into
the blur rather than being outlined against it.

**Dark-first.** The token values ship as dark-theme HSL by default (this is
Medialane's primary visual identity — near-black backgrounds, high-contrast
text, saturated brand accents). Compose accordingly: light surfaces read as
the exception, not the default.

**Where the truth lives.** `styles.css` (imports the token/`_ds_bundle.css`
closure) is the full compiled stylesheet — read it before inventing a class
name that isn't in the table above. Each component's own
`components/<group>/<Name>/<Name>.prompt.md` documents its exact props.

**Idiomatic build example** — a marketplace-style card grid:

```tsx
import { TokenCard, cn } from '@medialane/ui';

<div className="grid grid-cols-3 gap-4">
  <TokenCard
    token={token}
    onBuy={handleBuy}
    className={cn("h-full", isFeatured && "ring-2 ring-primary")}
  />
</div>
```
