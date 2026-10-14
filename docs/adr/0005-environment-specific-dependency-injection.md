# 0005. Environment-specific dependency injection

## Status

Accepted (2026-10-14)

## Context

A single global configuration object leads to `if (process.env.NODE_ENV === "test")` branches scattered through production code. Local development should not need API keys, and tests should never reach a real external system.

## Decision

`src/composition` exports one container factory per environment:

- `createProductionContainer()`: real adapters, secrets read from environment variables.
- `createLocalContainer()`: works with no API keys, using stdout or no-op adapters where a real one would need credentials.
- `createTestContainer()`: in-memory fakes for every external dependency, returned alongside the container so tests can seed and inspect them.

The container is a plain object of constructed use cases and the ports they share. Non-secret configuration (URLs, feature flags, model names) is written in code inside each factory, visible and versioned. Only secrets come from environment variables, and never a default value for them.

Every external adapter in `src/infrastructure` ships with an in-memory fake in the same directory that:

- records its calls in a readable `calls` array,
- offers domain helpers to seed state, for example `seedUser(user)`,
- exposes `reset()`.

Good:

```ts
export class InMemoryEmailSender implements EmailSender {
  readonly calls: SentEmail[] = [];

  async send(email: SentEmail): Promise<void> {
    this.calls.push(email);
  }

  reset(): void {
    this.calls.length = 0;
  }
}
```

Bad:

```ts
export class EmailSender {
  async send(email: SentEmail): Promise<void> {
    if (process.env.NODE_ENV === "test") return;
    await sendgrid.send(email);
  }
}
```

## Consequences

Production code has no environment branches. Local onboarding is `yarn dev` with no secrets. Fakes are first-class code, reviewed and typed like adapters.
