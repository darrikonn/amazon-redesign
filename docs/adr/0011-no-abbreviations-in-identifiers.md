# 0011. No abbreviations in identifiers

## Status

Accepted (2026-10-14)

## Context

`qty`, `sym`, `dte`, `ctx`, `req`: each one is obvious to its author and a lookup for everyone else. Autocomplete removes the typing cost of the long form.

## Decision

Identifiers use whole words: `quantity`, `symbol`, `daysToExpiry`, `context`, `request`. Allowed exceptions:

- `id`,
- loop index `i` in a trivial loop,
- the exception variable in a handler that uses it immediately,
- field names that must match an external API,
- domain acronyms that are universal in the field and whose long form is unreasonably long (for example `URL`, `HTTP`, `JSON`).

Good:

```ts
function calculateNotional(quantity: number, price: number): number {
  return quantity * price;
}
```

Bad:

```ts
function calcNotl(qty: number, px: number): number {
  return qty * px;
}
```

## Consequences

Code reads as prose. Names are longer and lines occasionally wrap. Reviewers flag abbreviations under the Standards axis (ADR 0015).
