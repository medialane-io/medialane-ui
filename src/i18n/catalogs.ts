import EN from "./catalog/en.js";
import type { Catalog } from "./translate.js";

type CatalogLoader = () => Promise<Catalog>;

const LOADERS: Record<string, CatalogLoader> = {};

export { EN };

export async function loadCatalog(locale: string, loaders: Record<string, CatalogLoader> = LOADERS): Promise<Catalog> {
  const load = loaders[locale];
  return load ? load() : EN;
}
