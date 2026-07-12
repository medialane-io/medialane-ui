#!/usr/bin/env node
// Patches _ds_bundle.js for browser IIFE context:
// 1. Prepends a process shim (Next.js uses process.env.* not available in browsers)
// 2. Stubs next/link, next/image, next/navigation (they require app router context)
// 3. Appends Tailwind utility CSS to _ds_bundle.css (scanned from src/ components)
// Run after package-build.mjs, before package-validate.mjs.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { createHash } from 'crypto';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

const out = process.argv[2] ?? './ds-bundle';
const bundleJs = join(out, '_ds_bundle.js');
const syncJson = join(out, '_ds_sync.json');

const PROCESS_SHIM = "if(typeof process===\"undefined\")var process={env:{NODE_ENV:\"development\"},platform:\"browser\"};\n";

// Stub factories — replace Next.js framework modules with plain browser equivalents.
// These exact strings match the wrapper factories esbuild emits for next/link, next/image,
// and next/navigation. The stubs use window.React (loaded before the bundle) to stay
// independent of the IIFE's internal module registry.
const NEXT_LINK_ORIGINAL = `"node_modules/next/link.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_link();
    }`;
// __toESM(mod, isNodeMode=1) sets target.default = mod when isNodeMode is truthy,
// then __copyProps skips 'default' because it already exists on target.
// So the stub must export the component fn directly (not wrapped in {default:fn})
// — that way target.default = fn (the fn itself), not an object.
const NEXT_LINK_STUB = `"node_modules/next/link.js"(exports, module) {
      module.exports = function Link(p) {
        return window.React.createElement('a', { href: p.href, className: p.className, onClick: p.onClick, style: p.style, 'aria-label': p['aria-label'] }, p.children);
      };
    }`;

const NEXT_IMAGE_ORIGINAL = `"node_modules/next/image.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_image_external();
    }`;
const NEXT_IMAGE_STUB = `"node_modules/next/image.js"(exports, module) {
      module.exports = function NextImage(p) {
        var s = p.fill ? Object.assign({ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: p.objectFit || 'cover' }, p.style) : p.style;
        return window.React.createElement('img', { src: p.src, alt: p.alt || '', width: p.fill ? undefined : p.width, height: p.fill ? undefined : p.height, className: p.className, style: s, onError: p.onError, loading: p.priority ? 'eager' : (p.loading || 'lazy') });
      };
    }`;

const NEXT_NAV_ORIGINAL = `"node_modules/next/navigation.js"(exports, module) {
      init_define_import_meta_env();
      module.exports = require_navigation();
    }`;
const NEXT_NAV_STUB = `"node_modules/next/navigation.js"(exports, module) {
      var noop = function(){};
      module.exports = { useRouter: function() { return { push: noop, replace: noop, prefetch: noop, back: noop, forward: noop, refresh: noop }; }, usePathname: function() { return '/'; }, useSearchParams: function() { return new URLSearchParams(); }, useParams: function() { return {}; }, notFound: noop, redirect: noop };
    }`;

let body = readFileSync(bundleJs, 'utf8');
const headerEnd = body.indexOf('\n') + 1;
const header = body.slice(0, headerEnd);
let rest = body.slice(headerEnd);

// The Tailwind append (below) is independent of the JS patch and runs either way —
// stamping the JS while the CSS step failed used to leave a bundle without utilities
// that "already patched" then refused to repair.
if (rest.startsWith(PROCESS_SHIM)) {
  console.error('  patch-bundle: bundle JS already patched, skipping to Tailwind append');
} else {
// Apply stubs before prepending the process shim so the shim check stays idempotent.
let patched = header + PROCESS_SHIM + rest;

if (patched.includes(NEXT_LINK_ORIGINAL)) {
  patched = patched.replace(NEXT_LINK_ORIGINAL, NEXT_LINK_STUB);
  console.error('  patch-bundle: stubbed next/link');
} else {
  console.error('  patch-bundle: WARNING — next/link factory not found (bundle format may have changed)');
}

if (patched.includes(NEXT_IMAGE_ORIGINAL)) {
  patched = patched.replace(NEXT_IMAGE_ORIGINAL, NEXT_IMAGE_STUB);
  console.error('  patch-bundle: stubbed next/image');
} else {
  console.error('  patch-bundle: WARNING — next/image factory not found (bundle format may have changed)');
}

if (patched.includes(NEXT_NAV_ORIGINAL)) {
  patched = patched.replace(NEXT_NAV_ORIGINAL, NEXT_NAV_STUB);
  console.error('  patch-bundle: stubbed next/navigation');
} else {
  console.error('  patch-bundle: WARNING — next/navigation factory not found (bundle format may have changed)');
}

writeFileSync(bundleJs, patched);

const newSha = createHash('sha256').update(patched).digest('hex').slice(0, 12);
const sync = JSON.parse(readFileSync(syncJson, 'utf8'));
sync.bundleSha12 = newSha;
writeFileSync(syncJson, JSON.stringify(sync, null, 2) + '\n');
console.error(`  patch-bundle: done, bundleSha12 → ${newSha}`);
}

// Append Tailwind utility classes to _ds_bundle.css.
// The library ships only a Tailwind preset — consuming apps run Tailwind against
// their own content. For Claude Design we must generate utilities ourselves so
// cards render with the correct dark theme, spacing, colors, etc.
const bundleCss = join(out, '_ds_bundle.css');
const repoRoot = join(dirname(new URL(import.meta.url).pathname), '..');
const twBin = join(repoRoot, 'node_modules', '.bin', 'tailwindcss');
const twConfig = join(dirname(new URL(import.meta.url).pathname), 'tw.config.cjs');

if (!existsSync(twConfig)) {
  // Write the Tailwind config on first run (scans the library's own src/).
  const twConfigContent = `module.exports = {
  content: [${JSON.stringify(join(repoRoot, 'src/**/*.{tsx,ts,jsx,js}'))}],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        price: 'hsl(var(--price))',
        'brand-blue': '#3b7bff', 'brand-electric': '#1a17ff', 'brand-indigo': '#5b4ce6',
        'brand-purple': '#8a5cf6', 'brand-rose': '#f6608f', 'brand-orange': '#fb8b46',
        'brand-price': '#f97316', 'brand-navy': '#0a0e1f',
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)', brand: '11px' },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};`;
  writeFileSync(twConfig, twConfigContent);
  console.error('  patch-bundle: wrote .design-sync/tw.config.cjs');
}

const twInput = '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n';
const twInputFile = join(dirname(new URL(import.meta.url).pathname), '_tw_input.css');
writeFileSync(twInputFile, twInput);

// Single invocation to a temp file (stdout capture hit execSync buffer/tty quirks).
// A failure here is fatal: a bundle without utilities renders every card unstyled.
const twOut = join(out, '_tw_utilities.tmp.css');
try {
  execSync(`"${twBin}" --config "${twConfig}" --input "${twInputFile}" --output "${twOut}" --minify`, { stdio: ['ignore', 'ignore', 'pipe'], cwd: repoRoot });
  const twCss = readFileSync(twOut, 'utf8');
  unlinkSync(twOut);
  if (twCss.length < 1000) throw new Error(`suspiciously small utilities output (${twCss.length} bytes)`);
  const existing = readFileSync(bundleCss, 'utf8');
  // Strip any previously appended Tailwind block (marked by a sentinel comment).
  const sentinel = '\n/* tw-utilities */\n';
  const base = existing.includes(sentinel) ? existing.slice(0, existing.indexOf(sentinel)) : existing;
  writeFileSync(bundleCss, base + sentinel + twCss);
  console.error(`  patch-bundle: appended Tailwind utilities to _ds_bundle.css (${twCss.length} bytes)`);
} catch (e) {
  console.error(`  patch-bundle: FATAL — Tailwind generation failed: ${e.message}`);
  process.exit(1);
}
