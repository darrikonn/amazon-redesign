# 0012. Owner id on every child table and in every repository filter

## Status

Accepted (2026-10-14)

## Context

Multi-tenant data leaks happen one query at a time: a child row fetched by its own id, with the owner checked only on the parent. Putting the owner id on every row and into every filter makes the leak structurally impossible instead of a matter of discipline.

## Decision

- Every row that belongs to an owner carries `owner_id`.
- Child tables repeat `owner_id` and use a composite foreign key `(parent_id, owner_id) REFERENCES parent(id, owner_id) ON DELETE CASCADE`, with an index on `owner_id`. A child can never belong to a different owner than its parent.
- Every repository method on an owned entity takes the owner id as a required argument. No method may return another owner's rows. The in-memory fakes enforce the same rule.
- Every repository exposes the same surface: `get` (nullable), `demand` (throws not found), `getMany`, `demandMany`, plus a single and a list data loader, all exported from the data access package index. `CLAUDE.md` names these language-neutrally as `get_many` and `demand_many`; in this TypeScript codebase they are spelled `getMany` and `demandMany`.

Good:

```ts
export interface TradeRepository {
  get(ownerId: string, id: string): Promise<Trade | null>;
  demand(ownerId: string, id: string): Promise<Trade>;
  getMany(ownerId: string, ids: readonly string[]): Promise<Trade[]>;
  demandMany(ownerId: string, ids: readonly string[]): Promise<Trade[]>;
}
```

```sql
CREATE TABLE trade_leg (
  id TEXT NOT NULL PRIMARY KEY,
  trade_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  FOREIGN KEY (trade_id, owner_id) REFERENCES trade (id, owner_id) ON DELETE CASCADE
);
CREATE INDEX trade_leg_owner_id ON trade_leg (owner_id);
```

Bad:

```ts
getTrade(id: string): Promise<Trade | null>;
```

## Consequences

Every repository call names its owner. Cross-owner access cannot be expressed in the port. Owner id columns add storage and one index per child table, which is accepted.
