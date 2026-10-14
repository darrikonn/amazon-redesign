# 0002. Test naming and placement

## Status

Accepted (2026-10-14)

## Context

Tests that live in a distant `tests/` tree drift from the code they cover and are easy to forget. The project also needs a visible line between tests of pure logic and tests that need wiring, because the two run at very different speeds and fail for different reasons.

## Decision

Tests sit in a `__test__` directory next to the code under test, split by kind:

- `__test__/unit/<name>.test.ts`: pure logic only. No container, no fakes, no I/O. The subject is a function with inputs and outputs.
- `__test__/integration/<name>.test.ts`: anything with a dependency. The subject is wired through the test container from `src/composition` (see ADR 0005), with in-memory fakes at the infrastructure boundary (see ADR 0013). An adapter's own integration test may run it against a local stand-in for the external system, such as `startLocalServer` from `src/test-support`.
- `__test__/sandbox/<name>.test.ts`: an infrastructure adapter against the real external system, with real credentials. These run only through `yarn test:sandbox`, never in `yarn test`, because the quality gate must run without secrets. A sandbox test fails, rather than skips, when its credentials are missing.

`<name>` matches the file under test, with the extension `.test.ts`, or `.test.tsx` when the subject renders JSX. Test files use absolute imports (ADR 0010). The runner is Vitest, invoked through `yarn test` for unit and integration tests and `yarn test:sandbox` for sandbox tests. `passWithNoTests` is enabled only until the first test exists and is removed with it.

Good:

```
src/component/pricing/
  fee-calculator.ts
  __test__/unit/fee-calculator.test.ts
src/use-case/
  place-order.ts
  __test__/integration/place-order.test.ts
```

Bad:

```
tests/pricing.test.ts
src/use-case/place-order.spec.ts
```

## Consequences

A missing test is visible in the same directory listing as the code. `yarn test` can later be split by path if the integration suite becomes slow. Describe blocks are named after the subject, and each `it` states observable behaviour, for example `it("rejects an order below the minimum quantity")`.
