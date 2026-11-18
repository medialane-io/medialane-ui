import type { Catalog } from "./translate.js";

type CatalogLoader = () => Promise<Catalog>;

const LOADERS: Record<string, CatalogLoader> = {};
const NONE: Catalog = {};

export async function loadCatalog(locale: string, loaders: Record<string, CatalogLoader> = LOADERS): Promise<Catalog> {
  const load = loaders[locale];
  return load ? load() : NONE;
}
