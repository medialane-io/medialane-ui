import { join } from "node:path";
import { loadCatalog } from "../catalogs.js";
import { readSources, scanSentences } from "./scan.js";

const code = process.argv[2];
if (!code) {
  console.error("usage: bun run i18n:missing <language code>");
  process.exit(1);
}

const { sentences, plurals } = scanSentences(readSources(join(import.meta.dir, "../..")));
const catalog = await loadCatalog(code);
const missing = [...sentences, ...plurals].filter((sentence) => !(sentence in catalog)).sort();
for (const sentence of missing) console.log(sentence);
console.error(`${missing.length} sentences without a ${code} translation`);
