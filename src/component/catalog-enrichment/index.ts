export { CATALOG_OVERRIDES } from "./catalog-override";
export {
  applyOverrides,
  buildCatalog,
  buildVocabulary,
  type Catalog,
  deliveryDaysFrom,
  deriveTags,
  dropRareTags,
  ENRICHMENT_RULES,
  extractColor,
  mapCategory,
  normaliseDummyJsonProduct,
  normaliseFakeStoreProduct,
  normaliseResponse,
  trimName,
} from "./enrich";
export { type CatalogOverrides, type ProductOverride, parseOverrides } from "./override";
export {
  availabilityFrom,
  buildProductDetails,
  dummyJsonDetails,
  fakeStoreDetails,
} from "./product-details";
export {
  parseDummyJsonResponse,
  parseFakeStoreResponse,
  type RawDummyJsonProduct,
  type RawFakeStoreProduct,
  type RawReview,
} from "./raw-source";
