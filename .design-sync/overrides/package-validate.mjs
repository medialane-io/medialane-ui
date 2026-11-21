#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { hypothesisLine } from '../../.ds-sync/lib/common.mjs';

const OUT = process.argv[2];
if (!OUT || !existsSync(OUT)) {
  console.error('usage: node package-validate.mjs <out-dir> [--render-sample N]');
  process.exit(1);
}
const rsFlag = process.argv.indexOf('--render-sample');
const RENDER_SAMPLE = rsFlag > 0 ? Number(process.argv[rsFlag + 1]) || 0 : 0;
const NO_RENDER_CHECK = process.argv.includes('--no-render-check');

const relOut = (p) => relative(OUT, p).replaceAll('\\', '/');

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error(`✗ ${msg}`); };
const warn = (msg) => { warnings++; console.error(`! ${msg}`); };
const ok = (msg) => console.error(`  ${msg}`);
const previewRemedy = (name) => existsSync(join('.design-sync', 'previews', `${name}.tsx`))
  ? `.design-sync/previews/${name}.tsx is already authored and still trips this check — portals/fixed positioning can collapse measured output; confirm the screenshot and record in NOTES.md if benign, or rework the preview`
  : `author .design-sync/previews/${name}.tsx — owned files win over generated ones`;

let ver;
try {
  ver = JSON.parse(readFileSync(join(OUT, '.ds-build-meta.json'), 'utf8'));
  ok(`.ds-build-meta.json: ${ver.componentCount} components (${ver.shape})`);
  if (ver.dtsStubbed) fail('[DTS_STUBBED] built with --skip-dts — re-run package-build without it before the upload gate');
} catch (e) { fail(`.ds-build-meta.json: ${e.message}`); }

const bundleJs = join(OUT, '_ds_bundle.js');
let headerMeta = null;
if (!existsSync(bundleJs)) fail('_ds_bundle.js missing — [NO_DIST] the package build failed');
else {
  const src = readFileSync(bundleJs, 'utf8');
  const kb = (statSync(bundleJs).size / 1024).toFixed(0);
  try { new Function(src); ok(`_ds_bundle.js: ${kb} KB, syntax OK`); }
  catch (e) { fail(`_ds_bundle.js: syntax error — ${e.message}`); }
  const m = /^\/\* @ds-bundle: (.*) \*\//.exec(src.split('\n', 1)[0]);
  if (!m) fail('_ds_bundle.js: missing first-line `/* @ds-bundle: {…} */` header');
  else {
    try {
      const meta = JSON.parse(m[1].replace(/\*\\\//g, '*/'));
      const missing = ['namespace', 'components', 'sourceHashes', 'inlinedExternals'].filter(
        (k) => meta[k] === undefined,
      );
      if (missing.length) fail(`_ds_bundle.js header missing field(s): ${missing.join(', ')}`);
      else if (typeof meta.namespace !== 'string' || !Array.isArray(meta.components)) {
        fail('_ds_bundle.js header: namespace must be a string and components an array');
      } else {
        ok(`_ds_bundle.js header: window.${meta.namespace}, ${meta.components.length} components, ${meta.inlinedExternals.length} inlined externals`);
        headerMeta = meta;
      }
    } catch (e) { fail(`_ds_bundle.js header: invalid JSON — ${e.message}`); }
  }
}

try {
  const sync = JSON.parse(readFileSync(join(OUT, '_ds_sync.json'), 'utf8'));
  const badShape = (v) => !v || typeof v !== 'object' || Array.isArray(v);
  const n = badShape(sync.renderHashes) ? -1 : Object.keys(sync.renderHashes).length;
  if (!sync.styleSha || n < 0 || (n === 0 && ver?.componentCount !== 0)) fail('_ds_sync.json missing styleSha/renderHashes — rebuild');
  else {
    let live = null;
    try { live = createHash('sha256').update(readFileSync(bundleJs)).digest('hex').slice(0, 12); } catch { }
    if (live && sync.bundleSha12 !== live) fail('_ds_sync.json is stale (bundleSha mismatch) — rebuild so the anchor describes this bundle');
    else ok(`_ds_sync.json: ${n} render hash(es), anchor matches the bundle`);
  }
  try {
    let manifest = null;
    try { manifest = JSON.parse(readFileSync(join(OUT, '.stories-map.json'), 'utf8')); }
    catch { ok('(render-hash recompute skipped — no .stories-map.json; off-script layouts skip this check)'); }
    const { renderHashFor } = await import(new URL('../../.ds-sync/lib/sync-hashes.mjs', import.meta.url).href);
    const stale = [];
    if (manifest) {
    for (const c of manifest.components ?? []) {
      const liveHash = renderHashFor(OUT, c, sync.shape === 'storybook'
        ? { stories: (c.stories ?? []).map((st) => ({ name: st.name, exportKey: st.exportKey ?? null, emitted: st.emitted ?? null })), srcSha: c.srcSha ?? null }
        : {});
      if (sync.renderHashes[c.name] !== liveHash) stale.push(c.name);
    }
    if (stale.length) fail(`[SYNC_STALE] _ds_sync.json renderHashes don't match disk for: ${stale.join(', ')} — rebuild (package-build.mjs) so the anchor describes this output`);
    else if (manifest.components?.length) ok(`_ds_sync.json render hashes match disk (${manifest.components.length} recomputed)`);
    }
  } catch (e) { fail(`_ds_sync.json recompute failed (${String(e.message ?? e).split('\n')[0]})`); }
} catch (e) {
  if (e?.code === 'ENOENT' && !existsSync(join(OUT, '.stories-map.json'))) warn('_ds_sync.json absent — acceptable only for an off-script layout; with no anchor the next sync re-verifies everything');
  else fail(`_ds_sync.json unreadable (${e.message}) — the verification anchor must upload with the bundle`);
}

const stylesCss = join(OUT, 'styles.css');
if (!existsSync(stylesCss)) fail('styles.css missing — the styles entry point the app reads');
else {
  const txt = readFileSync(stylesCss, 'utf8');
  let n = 0, missing = 0;
  for (const m of txt.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) {
    n++;
    if (/^https?:|^data:/.test(m[1])) continue;
    if (!existsSync(join(OUT, m[1]))) { missing++; fail(`[CSS_IMPORT_MISSING] styles.css @imports "${m[1]}" which doesn't exist under ${OUT}`); }
  }
  if (n > 0) { if (!missing) ok(`styles.css: ${n} @import(s), all resolve`); }
  else if (/@ds-styles:\s*runtime/.test(txt)) {
    warn('[CSS_RUNTIME] styles.css has no @imports — DS styles itself at runtime (CSS-in-JS). OK; verify the render check passes. If the DS does ship a stylesheet, set cfg.cssEntry. Already set cfg.cssEntry and renders verify? Then this is informational — do not chase it.');
  } else {
    fail('styles.css has no @import lines — no tokens/component/font CSS was scraped');
  }
  let bundleTxt = '';
  try { bundleTxt = readFileSync(join(OUT, '_ds_bundle.css'), 'utf8'); } catch { }
  if (bundleTxt.trim() && !bundleTxt.startsWith('/* @ds-css-runtime') && !/@import\s+(?:url\()?["']\.\/_ds_bundle\.css["']/.test(txt)) {
    fail('[CSS_BUNDLE_UNREACHABLE] _ds_bundle.css has real CSS but styles.css does not @import it — rebuild (or add `@import "./_ds_bundle.css";`)');
  }
  for (const m of bundleTxt.matchAll(/@import\s+(?:url\()?["']([^"']+)["']/g)) {
    if (/^https?:|^data:/.test(m[1])) continue;
    if (!existsSync(join(OUT, m[1]))) fail(`[CSS_IMPORT_MISSING] _ds_bundle.css @imports "${m[1]}" which doesn't exist under ${OUT}`);
  }
}

const bundleCss = join(OUT, '_ds_bundle.css');
if (existsSync(bundleCss)) {
  const sz = statSync(bundleCss).size;
  const txt = readFileSync(bundleCss, 'utf8');
  const stripped = txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@(import|charset)\b[^;]*;/g, '').trim();
  if (txt.includes('@ds-css-runtime')) {
    console.error('[CSS_RUNTIME] _ds_bundle.css is the runtime-styles stub — expected for CSS-in-JS DSes');
  } else if (sz < 500 && stripped.length === 0) {
    fail(`[CSS_PLACEHOLDER] _ds_bundle.css is ${sz}B of @import-only stub — set cfg.cssEntry to the compiled stylesheet (storybook repos: the build-time CSS fallback should have caught this — check for [CSS_FROM_STORYBOOK] in the build log)`);
  } else ok(`_ds_bundle.css: ${(sz / 1024).toFixed(0)} KB`);
}

try {
  const cssFiles = [bundleCss, stylesCss];
  if (existsSync(stylesCss)) {
    for (const m of readFileSync(stylesCss, 'utf8').matchAll(/@import\s+(?:url\()?["']([^"')]+)["']/g)) {
      if (!/^https?:|^data:/.test(m[1])) cssFiles.push(join(OUT, m[1]));
    }
  }
  let allCss = cssFiles.filter(p => existsSync(p)).map(p => readFileSync(p, 'utf8')).join('\n');
  if (existsSync(bundleJs)) {
    const js = readFileSync(bundleJs, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of js.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) allCss += `\n${m[1]}:;`;
    for (const m of js.matchAll(/['"`](--[\w-]+)['"`]\s*:/g)) allCss += `\n${m[1]}:;`;
  }
  (function scanStyles(d) {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) scanStyles(p);
      else if (e.name.endsWith('.html')) {
        for (const m of readFileSync(p, 'utf8').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) allCss += '\n' + m[1];
      }
    }
  })(join(OUT, 'components'));
  const defined = new Set([...allCss.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
  const referenced = [...new Set([...allCss.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map(m => m[1]))];
  const missing = referenced.filter(v => !defined.has(v));
  if (missing.length > 3) {
    warn(`[TOKENS_MISSING] ${missing.length} CSS custom ${missing.length === 1 ? 'property' : 'properties'} referenced but not defined in shipped stylesheets: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ', …' : ''}. Set cfg.tokensPkg (or cfg.tokensGlob) to the package that defines them, or cfg.provider if they're injected at runtime by a theme provider. Vars a component sets at runtime (inline style / JS) are EXPECTED to be absent here — check a rendered preview before chasing.`);
  } else if (referenced.length) {
    ok(`tokens: ${defined.size} defined, ${referenced.length} referenced${missing.length ? ` (${missing.length} missing, below threshold)` : ''}`);
  }
} catch {}

try {
  const GENERIC_FAMILIES = new Set([
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'math', 'emoji', 'fangsong',
    'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded',
    '-apple-system', 'blinkmacsystemfont', 'roboto', 'arial', 'verdana', 'tahoma', 'georgia',
    'courier', 'courier new', 'times', 'times new roman', 'apple color emoji',
    'ubuntu', 'cantarell', 'oxygen', 'fira sans', 'droid sans',
    'sf mono', 'sfmono-regular', 'menlo', 'monaco', 'consolas', 'liberation mono',
    'liberation sans', 'liberation serif',
    'san francisco', 'bitstream vera sans mono', 'dejavu sans', 'dejavu sans mono',
    'hiragino kaku gothic pron', 'hiragino sans', 'yu gothic', 'yugothic', 'meiryo',
    'ms pgothic', 'ms gothic', 'osaka', 'malgun gothic', 'apple gothic',
    'mingliu', 'pmingliu', 'microsoft jhenghei', 'microsoft jhenghei ui', 'simsun', 'simhei',
    'heiti sc', 'heiti sc light', 'heiti tc', 'heiti tc light', 'pingfang sc', 'pingfang tc',
    'inherit', 'initial', 'unset', 'revert', 'revert-layer', 'none', 'auto',
    'normal', 'italic', 'bold', 'bolder', 'lighter', 'oblique', 'small-caps',
  ]);
  const runtimePrefixes = (ver?.runtimeFontPrefixes ?? []).map((p) => p.toLowerCase()).filter(Boolean);
  const isGeneric = (f) =>
    GENERIC_FAMILIES.has(f) ||
    /^(segoe ui|noto|helvetica|ui-)/.test(f) ||
    runtimePrefixes.some((p) => f.startsWith(p));
  const cssPaths = [bundleCss, join(OUT, 'fonts', 'fonts.css')];
  if (existsSync(stylesCss)) {
    cssPaths.push(stylesCss);
    for (const m of readFileSync(stylesCss, 'utf8').matchAll(/@import\s+(?:url\()?["']([^"')]+)["']/g)) {
      if (!/^https?:|^data:/.test(m[1])) cssPaths.push(join(OUT, m[1]));
    }
  }
  const declared = new Set();
  const dangling = new Map();
  const cssChunks = [];
  for (const p of cssPaths) {
    if (!existsSync(p)) continue;
    const chunk = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    cssChunks.push(chunk);
    for (const m of chunk.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      const fam = m[1].match(/font-family\s*:\s*['"]?([^;'"\n}]+)['"]?/)?.[1]?.trim();
      if (!fam) continue;
      const key = fam.toLowerCase();
      let hasLocal = false, hasResolved = dangling.has(key) ? false : declared.has(key);
      for (const u of m[1].matchAll(/url\(\s*['"]?([^'")]+?\.(?:woff2?|ttf|otf|eot))(?:[?#][^'")]*)?['"]?\s*\)/gi)) {
        if (/^(https?|data):/i.test(u[1])) { hasResolved = true; continue; }
        hasLocal = true;
        if (existsSync(resolve(dirname(p), u[1]))) hasResolved = true;
        else if (!dangling.has(key)) dangling.set(key, u[1]);
      }
      if (hasResolved || !hasLocal) dangling.delete(key);
      declared.add(key);
    }
  }
  const css = cssChunks.join('\n');
  const hasRemoteFonts = /@import[^;]*(?:fonts\.googleapis|fonts\.gstatic|use\.typekit|fonts\.bunny)/i.test(css);
  const customProps = new Map();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) customProps.set(m[1], m[2].trim());
  const resolveVars = (v, depth = 0) => (depth > 3 ? v : v.replace(/var\(\s*(--[\w-]+)[^)]*\)/g, (_, name) =>
    (customProps.has(name) ? resolveVars(customProps.get(name), depth + 1) : '')));
  const missing = new Map();
  const collect = (value, hint) => {
    for (let part of resolveVars(String(value)).split(',')) {
      part = part.trim().replace(/^['"]|['"]$/g, '').trim();
      if (!part || !/^\p{L}/u.test(part) || !/^[\p{L}\p{N}_ -]+$/u.test(part)) continue;
      const key = part.toLowerCase();
      if (isGeneric(key) || declared.has(key) || missing.has(key)) continue;
      missing.set(key, { display: part, hint });
    }
  };
  const sansFontFace = css.replace(/@font-face\s*\{[^}]*\}/g, '');
  for (const m of sansFontFace.matchAll(/font-family\s*:\s*([^;}]+)/g)) collect(m[1], null);
  for (const [name, value] of customProps) {
    if (/font/i.test(name) && !/font-(feature|variation|variant|kerning|stretch|optical|smooth(?:ing)?|size|weight|style|display|color|palette|leading|numeric|case|transform|synthesis)/i.test(name)) collect(value, name);
  }
  if (missing.size) {
    const list = [...missing.values()].map((m) => `"${m.display}"${m.hint ? ` (${m.hint})` : ''}`).join(', ');
    if (hasRemoteFonts) {
      ok(`[FONT_REMOTE] ${list} — a remote font-host @import is present; assuming it serves these at runtime`);
    } else {
      warn(`[FONT_MISSING] ${list} referenced by the shipped CSS but no @font-face ships them — add the woff2 + @font-face via cfg.extraFonts, or accept substitutes (the DS pane will render with system fonts)`);
    }
  }
  if (dangling.size) {
    const list = [...dangling.entries()].map(([fam, u]) => `"${fam}" (url: ${u})`).join(', ');
    warn(`[FONT_DANGLING] ${list} — @font-face is shipped but its url() target isn't (the rule emits but the font file wasn't copied; check cfg.extraFonts paths or the build log for a "resolves outside" skip)`);
  }
} catch { }

if (!existsSync(join(OUT, 'README.md'))) fail('README.md missing');
let previews = 0, prompts = 0, badCard = 0, badLink = 0, badPrompt = 0;
(function walk(d) {
  if (!existsSync(d)) return;
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    const rel = relOut(p);
    if (e.name.endsWith('.html')) {
      previews++;
      const txt = readFileSync(p, 'utf8');
      if (!/^<!--\s*@dsCard\s+group="[^"]*"[^>]*-->/.test(txt.split('\n', 1)[0])) {
        badCard++; fail(`[DSCARD_MISSING] ${rel}: first line isn't a \`<!-- @dsCard group="…" -->\` comment`);
      }
      for (const m of txt.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)) {
        if (/^https?:|^data:/.test(m[1])) continue;
        if (m[1].endsWith('/_ds_bundle.css') && !existsSync(bundleCss)) continue;
        if (!existsSync(resolve(dirname(p), m[1]))) {
          badLink++; fail(`[LINK_HREF_MISSING] ${rel}: <link href="${m[1]}"> doesn't resolve`);
        }
      }
    } else if (e.name.endsWith('.prompt.md')) {
      prompts++;
      if (!readFileSync(p, 'utf8').split('\n', 1)[0].trim()) {
        badPrompt++; fail(`[PROMPT_EMPTY] ${rel}: first line is empty`);
      }
    }
  }
})(join(OUT, 'components'));
const tokensOnly = ver?.componentCount === 0;
if (previews === 0 && !tokensOnly) fail('no <Name>.html previews under components/');
else if (!badCard && !badLink && !badPrompt) ok(tokensOnly ? 'tokens-only DS — no component previews' : `components/: ${previews} previews, ${prompts} .prompt.md`);
if (ver && previews !== ver.componentCount) {
  fail(`count mismatch: ${previews} previews vs ${ver.componentCount} components`);
}

try {
  const { ts } = await import('ts-morph');
  let dtsErrs = 0;
  (function walkDts(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) { walkDts(p); continue; }
      if (!e.name.endsWith('.d.ts')) continue;
      const sf = ts.createSourceFile(p, readFileSync(p, 'utf8'), ts.ScriptTarget.Latest, false);
      for (const diag of sf.parseDiagnostics ?? []) {
        const { line } = sf.getLineAndCharacterOfPosition(diag.start ?? 0);
        fail(`[DTS_PARSE] ${relOut(p)}:${line + 1}: ${ts.flattenDiagnosticMessageText(diag.messageText, ' ')}`);
        dtsErrs++;
      }
    }
  })(join(OUT, 'components'));
  if (!dtsErrs) ok(`all .d.ts parse cleanly`);
} catch {
  console.error('  (.d.ts parse check skipped — ts-morph not in node_modules)');
}

let pw;
if (!NO_RENDER_CHECK) { try { pw = await import('playwright'); } catch { } }
if (!pw) {
  rmSync(join(OUT, '.render-check.json'), { force: true });
  if (NO_RENDER_CHECK) {
    warn('[RENDER_SKIPPED] render check did not run (--no-render-check) — previews are NOT visually verified');
  } else {
    fail('[RENDER_SKIPPED] playwright not importable — the render check did NOT run. `npm i -D playwright && npx playwright install chromium`, then re-run validate (or pass --no-render-check to accept an unverified bundle).');
  }
} else {
  const htmls = [];
  (function collect(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) collect(p);
      else if (e.name.endsWith('.html')) htmls.push(relOut(p));
    }
  })(join(OUT, 'components'));
  const sample = RENDER_SAMPLE && htmls.length > RENDER_SAMPLE
    ? htmls.filter((_, i) => i % Math.ceil(htmls.length / RENDER_SAMPLE) === 0)
    : htmls;
  if (sample.length < htmls.length) {
    console.error(`  render check: sampling ${sample.length}/${htmls.length} previews (pass --render-sample 0 for all)`);
  }
  const { serveDir } = await import(new URL('../../.ds-sync/storybook/http-serve.mjs', import.meta.url).href);
  const { srv, port } = await serveDir(OUT);
  const shotDir = join(OUT, '_screenshots');
  mkdirSync(shotDir, { recursive: true });
  const results = [];
  let browser;
  try {
    browser = await pw.chromium.launch(
      process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {},
    );
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    let pageErrs = [];
    page.on('pageerror', (e) => pageErrs.push(String(e).split('\n')[0]));

    if (headerMeta?.components?.length) {
      try {
        await page.goto(`http://127.0.0.1:${port}/`);
        await page.setContent(
          '<!doctype html><script src="/_vendor/react.js"></script>' +
          '<script src="/_vendor/react-dom.js"></script>' +
          '<script src="/_ds_bundle.js"></script>',
        );
        await page.waitForFunction((g) => !!window[g], headerMeta.namespace, { timeout: 10_000 }).catch(() => {});
        const { exp, compound, bad } = await page.evaluate(({ g, ns }) => {
          const NS = window[g] ?? {};
          const isFn = (v) => typeof v === 'function' || (v && v.$$typeof);
          const isCompound = (v) => v && typeof v === 'object' && Object.values(v).some(isFn);
          const compound = [], bad = [];
          for (const n of ns) {
            if (isFn(NS[n])) continue;
            if (isCompound(NS[n])) compound.push(n);
            else bad.push(n);
          }
          return { exp: Object.keys(NS).length, compound, bad };
        }, { g: headerMeta.namespace, ns: headerMeta.components.map((c) => c.name) });
        if (compound.length) console.error(`  [BUNDLE_EXPORT] ${compound.length} compound namespace(s) (usable via .Sub): ${compound.slice(0, 8).join(', ')}${compound.length > 8 ? ', …' : ''}`);
        if (bad.length) fail(`[BUNDLE_EXPORT] ${bad.length}/${headerMeta.components.length} not a component on window.${headerMeta.namespace}: ${bad.slice(0, 8).join(', ')}${bad.length > 8 ? ', …' : ''}`);
        else ok(`window.${headerMeta.namespace}: ${exp} exports (${headerMeta.components.length - compound.length} fn + ${compound.length} compound)`);
      } catch (e) {
        console.error(`  (bundle-export smoke skipped — ${String(e).split('\n')[0]})`);
      }
    }

    for (const rel of sample) {
      pageErrs = [];
      const [, group, name] = rel.match(/^components\/([^/]+)\/([^/]+)\//) ?? [,'misc', rel.split('/').pop()];
      const shot = join(shotDir, `${group}__${name}.png`);
      let pngBytes = 0, rootEmpty = true, err = null, caught = 0, firstCaught = null, texts = [], nEls = 0, variantsIdentical = false, hollow = [], maxHeight = 0, nPlaceholder = 0, nFallback = 0, gridOverflow = null, gridOverflowCells = [], storyExports = [];
      try {
        await page.goto(`http://127.0.0.1:${port}/${rel}`, { waitUntil: 'networkidle', timeout: 15000 });
        ({ rootEmpty, caught, firstCaught, texts, nEls, variantsIdentical, hollow, maxHeight, nPlaceholder, nFallback, gridOverflow, gridOverflowCells, storyExports } = await page.evaluate(() => {
          const stylePaints = (cs) => {
            if (cs.backgroundImage !== 'none') return true;
            if (!/^(rgba\(0, 0, 0, 0\)|transparent|)$/.test(cs.backgroundColor)) return true;
            if (cs.boxShadow !== 'none') return true;
            for (const s of ['Top', 'Right', 'Bottom', 'Left']) {
              if (parseFloat(cs[`border${s}Width`]) > 0 && !/transparent|rgba\(0, 0, 0, 0\)/.test(cs[`border${s}Color`])) return true;
            }
            return false;
          };
          const paints = (root) => {
            for (const el of [root, ...root.querySelectorAll('*')]) {
              if (el.hasAttribute?.('data-ds-placeholder')) continue;
              if (/^(IMG|SVG|CANVAS|VIDEO|IFRAME|PICTURE|HR)$/.test(el.tagName)) return true;
              if (stylePaints(getComputedStyle(el))) return true;
              for (const pe of ['::before', '::after']) {
                const ps = getComputedStyle(el, pe);
                if (ps.content === 'none' || ps.content === 'normal') continue;
                if ((ps.content !== '""' && ps.content !== "''") || stylePaints(ps)) return true;
              }
            }
            return false;
          };
          const roots = document.querySelectorAll('#root, [id^="r"]');
          const portals = [...document.body.children].filter((c) =>
            !c.matches('#root, [id^="r"], .ds-grid, .ds-cell, section, script, style, link'));
          let caught = 0, firstCaught = null, nEls = 0, maxHeight = 0;
          const nPlaceholder = document.querySelectorAll('[data-ds-placeholder]').length;
          const texts = [], htmls = [], hollow = [];
          for (const r of roots) {
            const t = r.textContent ?? '';
            if (t.startsWith('⚠')) { caught++; firstCaught ??= t.slice(2, 150); continue; }
            texts.push(t.trim());
            htmls.push(r.innerHTML);
            hollow.push(!t.trim() && !paints(r));
            nEls = Math.max(nEls, r.querySelectorAll('*').length);
            for (const el of r.children.length ? r.children : [r]) {
              maxHeight = Math.max(maxHeight, el.getBoundingClientRect().height);
            }
          }
          const pText = portals.map((p) => p.textContent ?? '').join(' ').trim();
          const pPaints = portals.some(paints);
          for (const p of portals) maxHeight = Math.max(maxHeight, p.getBoundingClientRect().height);
          if (pText || pPaints) for (let i = 0; i < texts.length; i++) {
            if (pText) texts[i] = (texts[i] + ' ' + pText).trim();
            if (pText || pPaints) hollow[i] = false;
          }
          const variantsIdentical = htmls.length > 1 && htmls.every((h) => h === htmls[0]);
          const nFallback = document.querySelectorAll('[data-ds-fallback]').length;
          let gridOverflow = null;
          let gridOverflowCells = [];
          if (window.__dsMode === 'grid' || window.__dsMode === 'column') {
            const subtreeShows = (root) => {
              let n = 0;
              for (const el of [root, ...root.querySelectorAll('*')]) {
                if (++n > 1500) return true;
                const b = el.getBoundingClientRect();
                if (b.width === 0 && b.height === 0) continue;
                const ecs = getComputedStyle(el);
                if (ecs.visibility !== 'visible') continue;
                if (/^(IMG|SVG|CANVAS|VIDEO|IFRAME|PICTURE|HR)$/.test(el.tagName)) return true;
                if ([...el.childNodes].some((t) => t.nodeType === 3 && t.textContent.trim())) return true;
                if (stylePaints(ecs)) return true;
              }
              return false;
            };
            const grid = document.querySelector('.ds-grid');
            const prevMaxWidth = grid ? grid.style.maxWidth : '';
            if (grid) grid.style.maxWidth = '680px';
            const wideCells = [], escapeCells = [];
            for (const cell of document.querySelectorAll('section.ds-cell')) {
              const label = cell.querySelector('h4')?.textContent ?? '?';
              let kind = window.__dsMode === 'grid' && cell.scrollWidth > cell.clientWidth + 8 ? 'wide' : null;
              let cellWalked = 0;
              for (const el of cell.querySelectorAll('*')) {
                if (++cellWalked > 1500) break;
                if (getComputedStyle(el).position !== 'fixed') continue;
                if (subtreeShows(el)) { kind = 'escape'; break; }
              }
              if (kind === 'wide') wideCells.push(label);
              else if (kind === 'escape') escapeCells.push(label);
              if (kind) gridOverflow = kind === 'escape' || gridOverflow === 'escape' ? 'escape' : 'wide';
            }
            if (grid) grid.style.maxWidth = prevMaxWidth;
            if (gridOverflow !== 'escape' && portals.some(subtreeShows)) gridOverflow = 'escape';
            gridOverflowCells = gridOverflow === 'escape' ? escapeCells : gridOverflow === 'wide' ? wideCells : [];
          }
          const storyExports = Array.isArray(window.__dsCells) ? window.__dsCells.slice(0, 8) : [];
          return { rootEmpty: !roots[0]?.innerHTML?.trim().length && !portals.length, caught, firstCaught, texts, nEls, variantsIdentical, hollow, maxHeight, nPlaceholder, nFallback, gridOverflow, gridOverflowCells, storyExports };
        }));
        await page.waitForTimeout(600).catch(() => {});
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
        const buf = await page.screenshot({ path: shot, fullPage: true });
        pngBytes = buf.length;
      } catch (e) { err = e.message.split('\n')[0]; }
      const blank = pngBytes > 0 && pngBytes < 5000;
      const errs = pageErrs.length + caught;
      const squash = (s) => s.replace(/[\s_-]+/g, '').toLowerCase();
      const nameS = squash(name);
      const nameReps = (t) => {
        const s = squash(t);
        return (s.length > 0 && s.length % nameS.length === 0
          && s === nameS.repeat(s.length / nameS.length)) ? s.length / nameS.length : 0;
      };
      const hasNameText = texts.some((t) => nameReps(t) >= 2);
      const hasRealText = texts.some((t) => t && nameReps(t) === 0);
      const nameOnly = hasNameText && !hasRealText;
      const hasPlaceholder = nPlaceholder > 0;
      const allHollow = hollow.length > 0 && hollow.every(Boolean);
      const collapsed = maxHeight < 8 && texts.some((t) => t.trim());
      const thin = !err && (nameOnly || allHollow || collapsed);
      const fallbackCard = !err && nFallback > 0;
      const bad = err || rootEmpty || (!fallbackCard && (errs || blank));
      const suggestedOverride = gridOverflow === 'escape'
        ? { cardMode: 'single' }
        : gridOverflow === 'wide' ? { cardMode: 'column' } : undefined;
      results.push({ name, group, rel, errs, caught, firstErr: pageErrs[0] ?? firstCaught ?? err, pngBytes, blank, rootEmpty, thin: thin && !fallbackCard, nameOnly, allHollow, collapsed, hasPlaceholder, nPlaceholder, fallbackCard, maxHeight: Math.round(maxHeight), variantsIdentical, bad, gridOverflow, gridOverflowCells: gridOverflow ? gridOverflowCells : undefined, suggestedOverride, texts });
      if (err) fail(`[RENDER] ${rel}: ${err}`);
      else if (rootEmpty) fail(`[RENDER] ${rel}: root empty`);
      else if (fallbackCard) { }
      else if (errs) {
        const first = pageErrs[0] ?? firstCaught;
        warn(`[RENDER_ERRORS] ${rel}: ${first} (${errs} total${caught ? `, ${caught} caught in-cell` : ''})`);
        const hyp = hypothesisLine(first);
        if (hyp) console.error(hyp);
      }
      else if (blank) warn(`[RENDER_BLANK] ${rel}: renders but PNG is ${pngBytes}B (<5KB — likely blank; ${previewRemedy(name)})`);
      else if (thin || variantsIdentical) warn(`[RENDER_THIN] ${rel}: ${variantsIdentical ? 'variants render identically' : nameOnly ? `mounted text is just "${name}"` : collapsed ? `DOM content present but rendered height is ${Math.round(maxHeight)}px` : 'mounts have no text and paint nothing'} — ${previewRemedy(name)}`);
      if (gridOverflow) {
        const who = gridOverflowCells.length
          ? ` (${gridOverflowCells.slice(0, 5).join(', ')}${gridOverflowCells.length > 5 ? ', …' : ''})`
          : '';
        const pick = storyExports.length
          ? `one of: ${storyExports.join(', ')}`
          : 'best export';
        warn(gridOverflow === 'escape'
          ? `[GRID_OVERFLOW] ${rel}: stories position content outside their cells${who} (fixed/portal) — no grid layout can present this. Merge into cfg.overrides.${name} in .design-sync/config.json: {"cardMode": "single", "primaryStory": "<${pick}>"}, then batch ALL flagged components into one targeted rebuild (preview-rebuild.mjs --components A,B,...). Grades carry and the targeted loop accepts presentation-only edits; no confirming re-validate needed — single cards are fully exempt from this check by construction.`
          : `[GRID_OVERFLOW] ${rel}: stories render wider than their grid cells${who} — the product card crops them. Merge into cfg.overrides.${name} in .design-sync/config.json: {"cardMode": "column"} (full card width per story, all stories kept), then batch ALL flagged components into one targeted rebuild (preview-rebuild.mjs --components A,B,...). Grades carry and the targeted loop accepts presentation-only edits; no confirming re-validate needed — column cards can't re-flag wide by construction (escape stays monitored).`);
      }
    }
    writeFileSync(join(OUT, '.render-check.json'), JSON.stringify(results, null, 2));
    const badOnes = results.filter((r) => r.bad);
    const floorOnes = results.filter((r) => r.fallbackCard);
    const floorNote = floorOnes.length ? ` (${floorOnes.length} showing the typographic floor card — unauthored previews, not failures)` : '';
    if (!badOnes.length) ok(`render check: ${results.length}/${results.length} previews render cleanly${floorNote} (screenshots in _screenshots/)`);
    else console.error(`  render check: ${results.length - badOnes.length}/${results.length} clean; ${badOnes.length} need attention${floorNote} (see .render-check.json, _screenshots/)`);
    try {
      rmSync(join(shotDir, 'contact-sheets.json'), { force: true });
      if (results.length) {
        const PER_SHEET = 16;
        const entries = [...results].sort((a, b) => a.name.localeCompare(b.name));
        const sheetCount = Math.ceil(entries.length / PER_SHEET);
        const statusOf = (r) => (r.fallbackCard ? '◌ floor card' : r.rootEmpty ? '✗ empty' : r.blank ? '✗ blank' : r.bad ? '✗ error' : r.thin ? '⚠ thin' : r.variantsIdentical ? '⚠ variants identical' : '✓');
        const borderOf = (r) => (r.bad ? '#d33' : r.thin || r.variantsIdentical ? '#d90' : '#ddd');
        const index = [];
        let failedTiles = 0;
        await page.setViewportSize({ width: 1500, height: 900 });
        for (let s = 0; s < sheetCount; s++) {
          const slice = entries.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
          const cells = slice.map((r) => {
            const shotName = `${r.group}__${r.name}.png`;
            let hasShot = false;
            try { hasShot = statSync(join(shotDir, shotName)).size > 0; } catch { hasShot = false; }
            const img = hasShot
              ? `<img src="./${shotName}" style="width:330px;height:300px;object-fit:cover;object-position:top left;display:block">`
              : `<div style="width:330px;height:300px;display:flex;align-items:center;justify-content:center;color:#999;font:14px system-ui">(no screenshot)</div>`;
            return `<div style="border:2px solid ${borderOf(r)};background:#fff;min-width:0">`
              + `<div style="font:600 18px system-ui;color:#222;padding:6px 8px;overflow-wrap:anywhere">${r.name} <span style="font-weight:400;color:#555">${statusOf(r)}</span></div>${img}</div>`;
          }).join('\n');
          const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;width:1500px">`
            + `<div style="font:600 20px system-ui;color:#222;padding:12px 10px">render check — sheet ${s + 1}/${sheetCount} — components ${s * PER_SHEET + 1}–${s * PER_SHEET + slice.length} of ${entries.length} (alphabetical)</div>`
            + `<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:0 10px 10px">${cells}</div></body></html>`;
          writeFileSync(join(shotDir, `.contact-sheet-${s + 1}.html`), html);
          await page.goto(`http://127.0.0.1:${port}/_screenshots/.contact-sheet-${s + 1}.html`, { waitUntil: 'networkidle', timeout: 15000 });
          await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
          failedTiles += await page.evaluate(() => {
            let n = 0;
            for (const img of [...document.images]) {
              if (img.complete && img.naturalWidth > 0) continue;
              const d = document.createElement('div');
              d.style.cssText = 'width:330px;height:300px;display:flex;align-items:center;justify-content:center;color:#c00;font:14px system-ui';
              d.textContent = '(screenshot failed to load)';
              img.replaceWith(d);
              n++;
            }
            return n;
          });
          await page.screenshot({ path: join(shotDir, `contact-sheet-${s + 1}.png`), fullPage: true });
          index.push({ sheet: s + 1, components: slice.map((r) => r.name) });
        }
        for (const f of readdirSync(shotDir)) {
          const m = /^\.?contact-sheet-(\d+)\.(?:png|html)$/.exec(f);
          if (m && Number(m[1]) > sheetCount) rmSync(join(shotDir, f), { force: true });
        }
        writeFileSync(join(shotDir, 'contact-sheets.json'), JSON.stringify(index, null, 2));
        console.error(`  contact sheets: ${sheetCount} sheet(s)${failedTiles ? `, ${failedTiles} tile(s) failed to load` : ''} → _screenshots/contact-sheet-1.png${sheetCount > 1 ? ` … contact-sheet-${sheetCount}.png` : ''}`);
      }
    } catch (e) {
      console.error(`  (contact sheets skipped — ${String(e).split('\n')[0]})`);
    }
  } catch (e) {
    fail(`[RENDER_SKIPPED] render check did not run (${String(e).split('\n')[0]}) — \`npx playwright install chromium\` and re-run, or pass --no-render-check to accept an unverified bundle`);
  } finally {
    await browser?.close();
    srv.close();
  }
}

const warnNote = warnings ? ` (${warnings} warning(s) — review above, non-blocking)` : '';
console.error(errors ? `\n${errors} error(s) — open a <Name>.html in a browser via \`npx serve ${OUT}\` to inspect.` : `\n✓ bundle is complete${warnNote}`);
process.exit(errors ? 1 : 0);
