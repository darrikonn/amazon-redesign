# 0021. Test builders live in `src/test-support`

## Status

Accepted (2026-10-14)

## Context

Unit tests for components need realistic entities, and integration tests need the same entities to seed fakes. Copying object literals into every test file makes them drift, and putting builders in `src/core` would ship test code as part of the domain's public API.

## Decision

Builders for test data live in `src/test-support`, exported from its `index.ts`, and are named `a<Entity>` (`aProduct`, `aShopper`). Each returns a complete, valid entity and takes a `Partial` of overrides, so a test states only the fields its assertion depends on.

Only test files import `@/test-support`. Production code never does. Builders import only `@/core` types. Shared test infrastructure, such as a local stand-in server for an external API, may live here too and may use Node built-ins.

Exception: acceptance tests of the search use cases seed the fake with the bundled `CATALOG` from `@/infrastructure`, because what they pin (result counts, suggestions, headlines, and the screens in `docs/screenshots/`) is the behaviour of that real catalogue. Every other test builds the products it needs.

Good:

```ts
const bag = aProduct({ priceInCents: 1999, tags: ["leather"] });
```

Bad:

```ts
const bag = { id: "x", name: "x", category: "bags", priceInCents: 1999 } as Product;
```

## Consequences

A new required field on an entity is added to one builder instead of every test. Tests read as the behaviour they check.
