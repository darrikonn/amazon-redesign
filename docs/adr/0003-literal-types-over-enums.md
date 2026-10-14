# 0003. Literal types over enums

## Status

Accepted (2026-10-14)

## Context

TypeScript `enum` emits a runtime object, allows numeric values nobody asked for, and does not narrow cleanly against plain strings coming from JSON or a database. String literal unions are checked exhaustively, cost nothing at runtime, and read as the data they represent.

## Decision

Constrained values are string literal unions, defined next to the entity that owns them. `enum` is not used. When an external schema (GraphQL, OpenAPI, a database driver) requires an enum, convert at the delivery boundary, never inside use cases or components. Where a runtime list is needed (validation, dropdowns), define the array once with `as const` and derive the type from it.

Good:

```ts
export const ORDER_STATUSES = ["open", "filled", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type Order = {
  id: string;
  status: OrderStatus;
};
```

Bad:

```ts
export enum OrderStatus {
  Open = "OPEN",
  Filled = "FILLED",
  Cancelled = "CANCELLED",
}
```

## Consequences

Exhaustive `switch` statements are checked by the compiler. Values stored as TEXT (ADR 0007) map directly to the type. Boundary converters are small and live in the delivery layer only.
