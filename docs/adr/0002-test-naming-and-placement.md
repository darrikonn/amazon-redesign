# 0002. Test naming and placement

## Status

Accepted (2026-10-14)

## Context

Tests that live in a distant `tests/` tree drift from the code they cover and are easy to forget. The project also needs a visible line between tests of pure logic and tests that need wiring, because the two run at very different speeds and fail for different reasons.

## Decision

Tests sit in a `__test__` directory next to the code under test, split by kind:

- `__test__/unit/<name>.test.ts`: pure logic only. No container, no fakes, no I/O. The subject is a function with inputs and outputs. Logic that depends on time takes an injected timer; its unit tests drive a hand-advanced `ManualTimer`, a deterministic clock rather than a fake of an external system. Logic that steps through the browser history takes an injected `AddressHistory`, and its tests drive a hand-landed `MemoryHistory` in the same way. Both sit in `src/app/_ui/__test__/unit/` beside the tests that use them, because they implement delivery types that `src/test-support` may not import.
- `__test__/integration/<name>.test.ts`: anything with a dependency. The subject is wired through the test container from `src/composition` (see ADR 0005), with in-memory fakes at the infrastructure boundary (see ADR 0013). An adapter's own integration test may run it against a local stand-in for the external system, kept in `src/test-support`.
- `__test__/sandbox/<name>.test.ts`: an infrastructure adapter against the real external system, with real credentials. Sandbox tests never run in `yarn test`, because the quality gate must run without secrets. The first sandbox test brings its own Vitest config and a `yarn test:sandbox` script. A sandbox test fails, rather than skips, when its credentials are missing. There are none today.

Scripts under `scripts/` are composition roots and keep their tests in `scripts/__test__/`, which `yarn test` includes. `scripts/__test__/integration/build-catalog.test.ts` is the catalogue's acceptance test: it rebuilds from the committed raw data and checks the committed catalogue, its vocabulary, and the example sentences.

`<name>` matches the file under test, with the extension `.test.ts`, or `.test.tsx` when the subject renders JSX. An adapter and its fake implement the same port, so their shared contract test is named after the port (`cart-line-repository.test.ts` for `CartLineRepository`, `session-store.test.ts` for `SessionStore`) and runs the same cases against both, the repository's loaders included. A case that needs one implementation's specifics, such as the calls a fake records, may sit in a file named after that file instead. Test files use absolute imports (ADR 0010). A test with three phases marks them `// Arrange`, `// Act`, and `// Assert`; a test that only acts and checks separates the two with a blank line and needs no markers. The runner is Vitest, invoked through `yarn test`. `passWithNoTests` is enabled only until the first test exists and is removed with it.

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
