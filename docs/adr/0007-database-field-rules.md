# 0007. Database field rules

## Status

Accepted (2026-10-14)

## Context

Nullable columns, defaults, and database enums each move a decision out of the application and into the schema, where it is invisible to the type checker. A forgotten field then becomes a silent NULL or a silent default instead of a failing insert. This project currently fakes storage, but the rules apply to the in-memory model now and to any real schema later.

## Decision

- Every column is NOT NULL, except an optional `modified` timestamp.
- No column DEFAULT values. The application supplies every field on insert.
- No database enum types. Constrained strings are TEXT, validated by the application's literal types (ADR 0003).
- `created` is set by the application model on construction. `modified` is null until the first update and then set automatically by the repository.

Good:

```sql
CREATE TABLE trade (
  id TEXT NOT NULL PRIMARY KEY,
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created TIMESTAMPTZ NOT NULL,
  modified TIMESTAMPTZ
);
```

Bad:

```sql
CREATE TYPE trade_status AS ENUM ('open', 'filled');
CREATE TABLE trades (
  id TEXT PRIMARY KEY,
  status trade_status DEFAULT 'open',
  created TIMESTAMPTZ DEFAULT now()
);
```

## Consequences

Entity types have no optional fields other than `modified`. A missing field fails at compile time or at insert, never later as a NULL in a report. Migrations never carry defaults, so backfills are explicit.
