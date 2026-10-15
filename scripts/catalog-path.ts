import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

// Where the catalogue build reads the committed source and writes what the app loads.
export const CATALOG_PATHS = {
  rawDirectory: path.join(ROOT, "src/infrastructure/product/data/raw"),
  catalog: path.join(ROOT, "src/infrastructure/product/data/catalog.json"),
  details: path.join(ROOT, "src/infrastructure/product/data/product-details.json"),
  vocabulary: path.join(ROOT, "src/component/catalog-vocabulary/vocabulary.json"),
} as const;
