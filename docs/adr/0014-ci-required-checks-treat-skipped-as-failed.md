# 0014. CI required checks treat skipped as failed

## Status

Accepted (2026-10-14)

## Context

A required check that is skipped, cancelled, or still pending shows no red mark, and a pull request can be merged on the strength of a check that never ran. Path filters, cancelled workflows, and flaky runners all produce this state.

## Decision

Only a green success counts as a pass for a required check. Skipped, cancelled, pending, and neutral all count as failed. In practice:

- Required workflows have no path filters that can skip the whole job. Format, lint, type check, and tests run on every push and pull request.
- A job that is cancelled is re-run, never bypassed.
- Before merging, the full list of required checks is read; a missing check is a failure.

Good:

```yaml
on:
  pull_request:
  push:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - run: yarn install --frozen-lockfile
      - run: yarn format --check
      - run: yarn lint
      - run: yarn test
```

Bad:

```yaml
on:
  pull_request:
    paths: ["src/**"]
```

## Consequences

Documentation-only changes run the full gate. That costs a few minutes and removes a whole class of unnoticed regressions.
