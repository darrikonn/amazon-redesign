# 0015. Two-axis review gate before every pull request

## Status

Accepted (2026-10-14)

## Context

A single review that mixes "does this follow our rules" with "does this do what was asked" ranks the two against each other, and one hides the other. Code can pass one axis and fail the other. Reviewers who can edit also quietly fix what they find, which hides the finding from the record.

## Decision

Before every pull request, after committing:

1. Run two read-only reviews of the diff against the base branch, each with fresh context:
   - Standards: every place the diff violates `CLAUDE.md` or an ADR, citing the rule. Hard violations separated from judgement calls. Skip what tooling already enforces.
   - Spec: requirements asked for but missing or partial, behaviour nobody asked for, and requirements that look implemented but are wrong, quoting the originating request for each.
2. Report the two axes separately. Never merge or rerank them.
3. Reviewers are judgement only. They may read files and run read-only commands. They never edit, format, or run a git command that mutates state.
4. Fix every correctness or safety finding, re-run the quality gate, and re-read the critical lines. Polish-only findings may ship.
5. After structural fixes, run a second round.

Good:

```
Standards
  Hard: src/app/api/order/route.ts imports @/infrastructure (ADR 0004).
  Judgement: PlaceOrder.execute is 40 lines; consider splitting (ADR 0001).

Spec
  Missing: request asked for "reject duplicate order ids"; no check exists.
  Unasked: added a DELETE endpoint nobody requested.
```

Bad:

```
Review: 3 issues found, fixed them and pushed.
```

## Consequences

Every pull request carries two short reports. Reviewing costs one extra pass. Findings stay visible because the reviewer cannot make them disappear.
