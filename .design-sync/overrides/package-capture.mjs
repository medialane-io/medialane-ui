#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { KEY_RECIPE, gradeKeyFrom, renderHashFor } from '../../.ds-sync/lib/sync-hashes.mjs';
import { serveDir } from '../../.ds-sync/storybook/http-serve.mjs';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i < 0 ? d : argv[i + 1]; };
{
  const VALUE_FLAGS = ['out', 'components', 'spot-check-components'];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--force') continue;
    if (argv[i].startsWith('--') && VALUE_FLAGS.includes(argv[i].slice(2))) { i++; continue; }
    console.error(`(unrecognized argument "${argv[i]}" — ignored; multi-component scoping is comma-separated: --components A,B)`);
  }
}
const OUT = flag('out') && resolve(flag('out'));
const ONLY = flag('components') ? new Set(flag('components').split(',').map((s) => s.trim())) : null;
const SPOT_PICKS = flag('spot-check-components') ? flag('spot-check-components').split(',').map((s) => s.trim()).filter(Boolean) : [];
const FORCE = argv.includes('--force');
if (!OUT || !existsSync(join(OUT, '.stories-map.json'))) {
  console.error('usage: package-capture.mjs --out <ds-bundle dir> (run package-build.mjs first)');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(join(OUT, '.stories-map.json'), 'utf8'));
if (manifest.keyRecipe !== KEY_RECIPE) for (const c of manifest.components ?? []) delete c.sourceKey;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const oldGradeKeyFor = (c) => gradeKeyFrom(renderHashFor(OUT, c, {}));
const gradeKeyFor = (c) => (c.sourceKey ? gradeKeyFrom(c.sourceKey) : oldGradeKeyFor(c));

const cacheDir = resolve('.design-sync', '.cache', 'review');
mkdirSync(cacheDir, { recursive: true });
writeFileSync(join(resolve('.design-sync', '.cache'), '.gitignore'), '*\n');
const shotBase = join(OUT, '_screenshots', 'review');
const rawDir = join(shotBase, 'raw');
mkdirSync(rawDir, { recursive: true });

const all = (manifest.components ?? []).filter((c) => existsSync(join(OUT, '_preview', `${c.name}.js`)));
const comps = ONLY ? all.filter((c) => ONLY.has(c.name) || SPOT_PICKS.includes(c.name)) : all;
const floorCount = (manifest.components ?? []).length - all.length;
if (floorCount && !ONLY) console.error(`  (${floorCount} component(s) on the floor card — author previews to bring them into grading)`);
const spotChecks = new Set(FORCE ? [] : SPOT_PICKS.filter((n) => all.some((c) => c.name === n)));
for (const n of SPOT_PICKS) {
  if (!spotChecks.has(n)) console.error(`! --spot-check-components: "${n}" matches no capturable component (typo? renamed? floor card with no compiled preview?) — pick ignored`);
}
if (spotChecks.size) {
  console.error(`◉ [SPOT_CHECK] re-verifying ${spotChecks.size} requested component(s): ${[...spotChecks].join(', ')} — grades kept; Read their fresh sheets and confirm they still match the recorded grades.`);
}

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('playwright not installed — npm i playwright (in .ds-sync/) first'); process.exit(2); }
const browser = await chromium.launch(process.env.DS_CHROMIUM_PATH ? { executablePath: process.env.DS_CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
try { await page.clock.setFixedTime(new Date('2024-05-15T12:00:00Z')); } catch { }
let pageErrs = [];
page.on('pageerror', (e) => pageErrs.push(String(e).split('\n')[0]));
const { srv, port } = await serveDir(OUT);

async function settle() {
  await page.evaluate(() => Promise.all([
    document.fonts?.ready,
    ...[...document.images].map((i) => i.decode().catch(() => {})),
  ])).catch(() => {});
  await page.waitForTimeout(600).catch(() => {});
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
}

const report = [];
for (const c of comps) {
  const rel = `components/${c.group}/${c.name}/${c.name}.html`;
  let cardHead;
  try { cardHead = readFileSync(join(OUT, rel), 'utf8').split('\n', 1)[0] ?? ''; }
  catch {
    report.push({ name: c.name, group: c.group, verdict: 'error', reason: `missing ${rel} — rebuild (package-build.mjs) before capturing` });
    console.error(`✗ [CAPTURE] ${c.name}: missing ${rel} — rebuild (package-build.mjs) before capturing`);
    continue;
  }
  const gradeKey = gradeKeyFor(c);
  const capPath = join(cacheDir, `${c.name}.json`);
  const gradePath = join(cacheDir, `${c.name}.grade.json`);
  let prev = null, grade = null;
  try { prev = JSON.parse(readFileSync(capPath, 'utf8')); } catch { }
  try { grade = JSON.parse(readFileSync(gradePath, 'utf8')); } catch { }
  if (c.sourceKey && prev && prev.gradeKey !== gradeKey && (prev.keyRecipe ?? 0) !== KEY_RECIPE &&
      prev.gradeKey === oldGradeKeyFor(c)) {
    prev = { ...prev, gradeKey, sourceKey: c.sourceKey, keyRecipe: KEY_RECIPE };
    writeFileSync(capPath, JSON.stringify(prev, null, 2));
  }

  const vpMatch = /viewport="(\d+)x(\d+)"/.exec(cardHead);
  const vp = vpMatch ? { width: Math.min(+vpMatch[1], 2000), height: Math.min(+vpMatch[2], 2000) } : { width: 900, height: 700 };

  pageErrs = [];
  let cells = [];
  try {
    await page.setViewportSize(vp);
    await page.goto(`http://127.0.0.1:${port}/${rel}`, { waitUntil: 'networkidle', timeout: 20_000 });
    cells = await page.evaluate(() => Array.isArray(window.__dsCells) ? window.__dsCells.slice() : []);
  } catch (e) {
    report.push({ name: c.name, group: c.group, verdict: 'error', reason: String(e.message ?? e).split('\n')[0] });
    console.error(`✗ [CAPTURE] ${c.name}: ${String(e.message ?? e).split('\n')[0]}`);
    continue;
  }
  if (cells.length === 0) {
    const why = pageErrs[0] ?? 'preview module evaluated to no exports (window.__dsCells is empty)';
    report.push({ name: c.name, group: c.group, verdict: 'error', reason: why });
    console.error(`✗ [CAPTURE] ${c.name}: ${why} — fix the preview (.design-sync/previews/${c.name}.tsx) and rebuild`);
    continue;
  }

  const fullyGraded = grade?.cells && cells.length > 0
    && cells.every((k) => ['good'].includes(grade.cells[k]?.verdict));
  if (!FORCE && fullyGraded && prev?.gradeKey === gradeKey && !spotChecks.has(c.name)) {
    if (prev.pendingGrade !== false) {
      writeFileSync(capPath, JSON.stringify({ ...prev, pendingGrade: false }, null, 2));
    }
    report.push({ name: c.name, group: c.group, skipped: true });
    console.error(`○ [CAPTURE] ${c.name}: carried forward`);
    continue;
  }
  if (grade && (FORCE || prev?.gradeKey !== gradeKey)) {
    rmSync(gradePath, { force: true });
    grade = null;
    console.error(`  (grade cleared for ${c.name} — ${FORCE ? '--force requested fresh verdicts' : 'contract changed'}; re-grade from the fresh sheet)`);
  }

  const shots = [];
  for (const label of cells) {
    try {
      await page.goto(`http://127.0.0.1:${port}/${rel}?story=${encodeURIComponent(label)}`, { waitUntil: 'networkidle', timeout: 20_000 });
    } catch (e) {
      if (!/Timeout/i.test(String(e.message ?? e))) { shots.push({ label, png: null, err: String(e.message ?? e).split('\n')[0] }); continue; }
    }
    await settle();
    const info = await page.evaluate(() => {
      const t = (document.getElementById('r0')?.textContent ?? '').trim();
      return { caught: t.startsWith('⚠'), text: t.slice(0, 200) };
    }).catch(() => ({ caught: false, text: '' }));
    const file = `${c.group}__${c.name}__${label}.png`;
    const png = await page.screenshot({ fullPage: false }).catch(() => null);
    if (png) writeFileSync(join(rawDir, file), png);
    shots.push({ label, png: png ? `raw/${file}` : null, err: info.caught ? info.text.slice(0, 120) : null });
  }

  const rows = shots.map((s) =>
    `<tr><td style="vertical-align:top;padding:8px;font:600 14px system-ui">${escapeHtml(s.label)}${s.err ? `<br><span style="color:#d33;font-weight:400;font-size:12px">${escapeHtml(s.err)}</span>` : ''}</td>` +
    `<td style="vertical-align:top;padding:8px;border-left:1px solid #eee">${s.png ? `<img src="./${s.png}" style="max-width:760px;max-height:520px;display:block">` : '<div style="color:#999">(no shot)</div>'}</td></tr>`).join('\n');
  const sheetHtml = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;width:980px;font-family:system-ui">` +
    `<div style="font:600 18px system-ui;padding:10px">${escapeHtml(c.name)} — authored preview (no reference: grade on the absolute rubric)</div>` +
    `<table style="border-collapse:collapse">${rows}</table></body></html>`;
  writeFileSync(join(shotBase, `.sheet-${c.group}__${c.name}.html`), sheetHtml);
  try {
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto(`http://127.0.0.1:${port}/_screenshots/review/.sheet-${c.group}__${c.name}.html`, { waitUntil: 'networkidle', timeout: 15_000 });
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
    await page.screenshot({ path: join(shotBase, `${c.group}__${c.name}.png`), fullPage: true });
  } catch (e) { console.error(`  (sheet skipped for ${c.name} — ${String(e).split('\n')[0]})`); }

  const pendingGrade = !(cells.length > 0 && cells.every((k) => grade?.cells?.[k]?.verdict === 'good'));
  writeFileSync(capPath, JSON.stringify({ gradeKey, sourceKey: c.sourceKey ?? null, keyRecipe: c.sourceKey ? KEY_RECIPE : undefined, cells, pendingGrade, shots: shots.map((s) => s.label), pageErrs: [...new Set(pageErrs)].slice(0, 3) }, null, 2));
  const errCells = shots.filter((s) => s.err).length;
  report.push({ name: c.name, group: c.group, cells: cells.length, errors: errCells });
  const keyHint = cells.length ? ` — grade keys: ${cells.map((k) => JSON.stringify(k)).join(', ')}` : '';
  console.error(`${errCells ? '✗' : '○'} [CAPTURE] ${c.name}: ${cells.length} cell(s)${errCells ? `, ${errCells} error(s)` : ' need grading'}${keyHint}`);
}

await browser.close();
srv.close();

if (!ONLY) {
  const live = new Set((manifest.components ?? []).map((c) => c.name));
  try {
    for (const f of readdirSync(cacheDir)) {
      const m = /^(.+?)(\.grade)?\.json$/.exec(f);
      if (!m || live.has(m[1])) continue;
      rmSync(join(cacheDir, f), { force: true });
      console.error(`  (pruned stale ${f} — component no longer in the sync)`);
    }
  } catch { }
  try {
    const unmerged = readdirSync(resolve('.design-sync', 'learnings')).filter((f) => f.endsWith('.md'));
    if (unmerged.length) console.error(`! [LEARNINGS_UNMERGED] ${unmerged.length} file(s) in .design-sync/learnings/ — fold into NOTES.md and delete them before upload`);
  } catch { }
}

const skipped = report.filter((r) => r.skipped);
const errors = report.filter((r) => r.verdict === 'error' || r.errors);
console.error(`\npackage-capture: ${report.length} component(s) — ${skipped.length} carried forward, ${report.length - skipped.length} captured, ${errors.length} with errors${floorCount && !ONLY ? `; ${floorCount} on the floor card (not graded)` : ''}`);
console.error('Grade from the sheets: Read each _screenshots/review/<group>__<Name>.png, then Write verdicts to .design-sync/.cache/review/<Name>.grade.json (keys must equal the cell labels exactly).');
process.exit(errors.length ? 1 : 0);
