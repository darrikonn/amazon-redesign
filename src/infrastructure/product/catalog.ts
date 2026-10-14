import type { Product } from "@/core";
import { parseCatalogFile } from "./catalog-file";
import catalogJson from "./data/catalog.json";

export const CATALOG: readonly Product[] = parseCatalogFile(catalogJson);
