#!/usr/bin/env node
// Patches _ds_bundle.js for browser IIFE context:
// 1. Prepends a process shim (Next.js uses process.env.* not available in browsers)
// 2. Stubs next/link, next/image, next/navigation (they require app router context)
// Run after package-build.mjs, before package-validate.mjs.
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

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

if (rest.startsWith(PROCESS_SHIM)) {
  console.error('  patch-bundle: already patched, skipping');
  process.exit(0);
}

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
