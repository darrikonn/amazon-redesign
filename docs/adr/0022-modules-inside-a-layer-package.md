# 0022. Modules inside a layer package

## Status

Accepted (2026-10-14)

## Context

ADR 0010 calls any directory subtree with an `index.ts` a package, and asks for absolute imports across packages. Each layer (`src/core`, `src/component`, `src/infrastructure`, and so on) is a package, but a layer also groups related code into subdirectories that need their own public surface, for example `src/component/query-interpretation` and `src/component/product-search`. Read literally, ADR 0010 would force `product-search` to import `@/component`, which is its own barrel and creates an import cycle.

## Decision

- The packages of ADR 0010 are the top-level directories under `src`. They are imported with the `@/` alias through their `index.ts`.
- A subdirectory with an `index.ts` inside a package is a module. Its `index.ts` is the module's public API. Sibling modules in the same package import each other relatively through that index, never into its files.
- The package `index.ts` re-exports the modules that other packages may use.

Good:

```ts
// src/component/product-search/filter-products.ts
import { demandCategory } from "@/core";
import { featurePhrase } from "../query-interpretation";
```

Bad:

```ts
import { featurePhrase } from "@/component";
import { featurePhrase } from "../query-interpretation/vocabulary";
```

## Consequences

A module can be moved inside its package without touching other packages. Review checks two things from the import path alone: `@/` for another package, `../<module>` for a sibling, and never a path into a sibling's files.
