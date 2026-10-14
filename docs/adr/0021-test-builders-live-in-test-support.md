# 0021. Test builders live in `src/test-support`

## Status

Accepted (2026-10-14)

## Context

Unit tests for components need realistic entities, and integration tests need the same entities to seed fakes. Copying object literals into every test file makes them drift, and putting builders in `src/core` would ship test code as part of the domain's public API.

## Decision

Builders for test data live in `src/test-support`, exported from its `index.ts`, and are named `a<Entity>` (`aProduct`, `aShopper`). Each returns a complete, valid entity and takes a `Partial` of overrides, so a test states only the fields its assertion depends on.

Only test files import `@/test-support`. Production code never does, and `src/test-support` imports only `@/core` types.

Exception: acceptance tests that pin the reference screens (the result counts, suggestions, and headlines the designs show) seed the fake with the bundled `CATALOG` from `@/infrastructure`, because those screens were drawn from exactly that catalog. Every other test builds the products it needs.

Good:

```ts
const lamp = aProduct({ priceInCents: 1999, features: ["dimmable"] });
```

Bad:

```ts
const lamp = { id: "x", title: "x", category: "desk-lamp", priceInCents: 1999 } as Product;
```

## Consequences

A new required field on an entity is added to one builder instead of every test. Tests read as the behaviour they check.
