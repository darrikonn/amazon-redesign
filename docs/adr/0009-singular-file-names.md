# 0009. Singular file names

## Status

Accepted (2026-10-14)

## Context

A mix of `trade.ts` and `trades.ts` in one tree forces every reader to guess, and `trades.ts` usually hides several unrelated things. A single rule removes the guess.

## Decision

File and directory names are singular, kebab-case: `trade.ts`, `trade-repository.ts`, `src/use-case/`, `src/component/`. A file named after an entity holds that entity and the code that owns it. A collection type lives in the singular file of its element.

Good:

```
src/core/trade.ts            // Trade, TradeStatus, TradeRepository port
src/use-case/place-order.ts
```

Bad:

```
src/core/trades.ts
src/use-cases/orders.ts
```

Exceptions: paths dictated by a framework, such as Next.js `app/` segments and `route.ts`, and directories whose name is a convention of the tooling (`node_modules`, `__test__`).

## Consequences

Import paths are predictable from the entity name. Renames are rare because files do not grow into plural grab-bags.
