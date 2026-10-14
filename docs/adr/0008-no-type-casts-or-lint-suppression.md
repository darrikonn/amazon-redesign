# 0008. No type casts or lint suppression

## Status

Accepted (2026-10-14)

## Context

A cast, a non-null assertion, an `any`, or a suppression comment tells the checker to trust the author. The checker then stops protecting that line forever, and the next edit inherits a hole nobody remembers.

## Decision

The code passes `tsc --noEmit` under `strict: true`, Biome, and ESLint with zero findings, and does so without:

- `as` casts (except `as const`),
- non-null assertions (`value!`),
- `any` or `unknown` narrowed by assertion,
- `// @ts-ignore`, `// @ts-expect-error`, `// eslint-disable`, `// biome-ignore`, or any equivalent,
- disabling or downgrading a lint rule in configuration to silence a finding.

If the checker complains, the code changes: narrow with a type guard, parse with a validator, or restructure.

Good:

```ts
function readPort(value: string | undefined): number {
  if (value === undefined) throw new Error("PORT is required");
  const port = Number(value);
  if (Number.isNaN(port)) throw new Error("PORT must be a number");
  return port;
}
```

Bad:

```ts
const port = Number(process.env.PORT!) as number;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const body: any = await request.json();
```

## Consequences

Untrusted input is parsed at the boundary with explicit validation. Some code is longer. Every line keeps the checker's protection.
