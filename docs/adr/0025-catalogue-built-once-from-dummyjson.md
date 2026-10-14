# 0025. The catalogue is built once from DummyJSON and committed

## Status

Accepted (2026-10-14)

## Context

The hand-written sample catalogue had 26 products in four categories. A believable storefront needs a few hundred real-looking products, but the app must stay fully offline at runtime and every build must be reproducible and reviewable.

## Decision

- `yarn catalog:build` (`scripts/build-catalog.ts`, run with tsx) is the only code that fetches product data. It fetches `https://dummyjson.com/products?limit=0`, and falls back to `https://fakestoreapi.com/products` when DummyJSON is unreachable. It saves the response byte for byte, normalises it, and writes the generated files. `yarn catalog:build --from-raw` rebuilds from the committed response without a network call.
- The build is deterministic: the same raw response always produces byte-identical output. A catalogue test rebuilds from the committed raw file and compares the result with the committed catalogue and vocabulary.
- Files, mapped onto the layers of ADR 0004:

| What | Where |
| --- | --- |
| Raw response, verbatim | `src/infrastructure/product/data/raw/<source>.json` |
| Generated catalogue | `src/infrastructure/product/data/catalog.json`, validated on load by `parseCatalogFile` |
| Generated vocabulary (live categories, tags with counts, colours) | `src/component/catalog-vocabulary/vocabulary.json` |
| Category groups, labels, synonyms, source mapping | `src/component/catalog-vocabulary/category-map.ts` |
| Keyword to tag rules | `src/component/catalog-vocabulary/tag-rules.ts` |
| Colour words | `src/component/catalog-vocabulary/color-word.ts` |
| Pure enrichment rules | `src/component/catalog-enrichment/enrich.ts` |
| Hand corrections, each with a `reason` | `src/component/catalog-enrichment/override.json` |

- The closed lists of category ids, tags, and colours live in `src/core`, so they stay literal unions (ADR 0003). The dictionaries in the component layer are `Record`s keyed by those ids, so the compiler insists that every id is defined.
- Enrichment is pure and rule-based: category groups from the source category, refined by a title word where a source category mixes kinds of product; tags from whole-word keywords in the source tags, title, and description; the first colour word in the title, then the description; delivery days from the shipping text. Tags that fewer than two products carry are dropped, so a suggestion never leads to a single product or a dead end. Overrides apply last, after every rule, so a correction is never undone; the catalogue test then fails if an override leaves a tag on fewer than two products.
- Prices are stored as `priceInCents` (ADR 0020), not as the source's decimal `price`.
- Generated JSON and the raw response are excluded from Biome, so `yarn format` never rewrites them.
- Ratings are the source's own, rounded to one decimal. Review counts are the source's own; DummyJSON ships three sample reviews per product, so cards hide the count instead of showing a misleading "(3)".
- Images are the source's own thumbnails, served through `next/image` from the hosts listed in `next.config.ts`. A missing or failing image falls back to a drawn category glyph.

- The request named `pnpm`, `src/lib`, `src/data`, and a decimal `price`. This repository uses yarn only (CLAUDE.md), the files sit in the layers in the table above, and prices are `priceInCents`. The file names follow ADR 0009 and ADR 0011: `override.json`, not `overrides.json`, and `vocabulary.json`, not `vocab.json`.
- `yarn shots` renders the five reference states (home, results, a headphones search, a laptops search, and zero results) plus each of the other example sentences, at 1440px and 390px, into `docs/screenshots/`.

## Consequences

Rebuilding the catalogue is a reviewable diff of generated files. Adding a category or a tag is a dictionary edit plus a rebuild. Product images still load from the source's CDN at runtime; offline, every card shows its glyph instead.
