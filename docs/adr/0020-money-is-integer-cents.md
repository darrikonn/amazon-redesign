# 0020. Money is an integer number of cents

## Status

Accepted (2026-10-14)

## Context

Prices are compared, bucketed ("under $30"), and split into dollars and cents for display. Binary floating point cannot represent most decimal prices exactly (`0.1 + 0.2 !== 0.3`), which makes comparisons such as "is $29.99 under $30" fragile.

## Decision

Every amount of money is an integer number of US cents, and its identifier says so: `priceInCents`, `maximumPriceInCents`. Parsing converts text such as `$39.99` to `3999` once, at the edge of the interpreter. Formatting back to dollars happens only in delivery or in copy-building components.

Good:

```ts
type Product = { priceInCents: number };
const isUnderBudget = product.priceInCents <= intent.maximumPriceInCents;
```

Bad:

```ts
type Product = { price: number }; // 29.99
const isUnderBudget = product.price <= 30;
```

## Consequences

All price arithmetic is exact. Every display site formats explicitly, which is a few more lines than printing a float.
