# 0016. Compiler flags beyond `strict`

## Status

Accepted (2026-10-14)

## Context

`strict: true` leaves three holes that bite in application code: an index access on an array or record is typed as present even when it is not, an optional property accepts an explicit `undefined` that the type did not promise, and an unused local or parameter is silently kept. Each one lets a wrong assumption compile.

## Decision

`tsconfig.json` enables, on top of `strict: true`:

- `noUncheckedIndexedAccess`: `array[i]` and `record[key]` are `T | undefined` and must be narrowed.
- `exactOptionalPropertyTypes`: an optional property is omitted, not set to `undefined`.
- `noImplicitOverride`: overriding a method requires `override`.
- `noUnusedLocals` and `noUnusedParameters`: dead names fail the type check.
- `noFallthroughCasesInSwitch`: every non-empty `case` ends with `break` or `return`.

These flags are never relaxed per file. If a flag makes a line awkward, the line changes (ADR 0008).

Good:

```ts
function firstSymbol(symbols: readonly string[]): string | null {
  const first = symbols[0];
  return first === undefined ? null : first;
}
```

Bad:

```ts
function firstSymbol(symbols: readonly string[]): string {
  return symbols[0];
}
```

## Consequences

Some lookups need an explicit `undefined` check. Optional fields are built by spreading conditionally instead of assigning `undefined`. The checker catches a class of runtime `undefined` errors at compile time.
