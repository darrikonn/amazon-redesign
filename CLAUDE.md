# Project Guidelines

## Before writing code
- Read `docs/adr/` first. The ADRs define the conventions for architecture, dependency injection, testing, types, database fields, imports, and naming. They apply to every task, including one-line fixes and pasted snippets, without being reminded.
- When a task implies a decision not covered by an ADR, write the ADR before or with the code.

## Architecture (Clean Architecture, ports and adapters)
- Dependencies point inward: delivery layer (HTTP, CLI, UI) -> use cases -> business components -> core interfaces. Infrastructure implements core interfaces and is injected; nothing inward ever imports infrastructure.
- The delivery layer only calls use cases. It never imports business components, repositories, data loaders, or infrastructure directly.
- Use cases and business components never contain raw SQL or raw external API calls. Custom queries live in a dedicated data service that is injected.
- Core defines interfaces (ports) and imports nothing from the outer layers.
- Pure analysis and calculation code has no side effects, no I/O, and depends only on the standard library.
- Composition roots (the application entry point and the test bootstrap) are the only places allowed to import from every layer.

## Dependency injection and configuration
- One DI container per environment: production defaults, local overrides, test overrides. Local development must work with no API keys, using stdout or no-op adapters. Tests bind in-memory fakes for every external dependency.
- Every new external adapter ships with an in-memory fake that records its calls, offers domain helpers to seed state, and has a `reset()`.
- Business rules (thresholds, limits, percentages, retry counts) are constants on the component that uses them, not settings and not environment variables.
- Only real secrets come from environment variables. Non-secret configuration (URLs, feature flags, model names) is written in code, per environment, where it is visible and versioned.
- Never commit secrets. Never print or log a secret. Never paste a secret into chat.

## Code structure (Stepdown Rule)
- Files read top-down: public entry points first, helpers below, ordered by first use. Each function is followed by the functions it calls, one level of abstraction at a time.
- Small functions with intention-revealing names. If a function needs a comment to be understood, split or rename it.

## Naming
- File names are singular (`trade.ts`, not `trades.ts`).
- No abbreviations in identifiers. `symbol` not `sym`, `quantity` not `qty`, `daysToExpiry` not `dte`. Allowed exceptions: `id`, loop index `i` in trivial loops, exception variable in a handler that uses it immediately, and field names that must match an external API.
- Domain acronyms are allowed only when they are universal in the field and the long form is unreasonably long.

## Types and enums
- Full strict typing everywhere. Code must pass the strict type checker with zero errors.
- Never use type casts, non-null assertions, `any`, or suppression comments (`# type: ignore`, `# noqa`, `// @ts-ignore`, `// eslint-disable`, or any equivalent). If the checker complains, fix the code.
- Never disable a lint rule. Fix the finding.
- Prefer closed string literal unions or literal type aliases over enum classes. Define them next to the entity that owns them and convert at the delivery boundary if a schema enum is required.

## Database (if the project has one)
- Every column is NOT NULL, except an optional `modified` timestamp.
- No column DEFAULT values. The application supplies every field on insert so a missing field fails immediately.
- No database enum types. Constrained strings are TEXT, validated by the application's literal types.
- `created` is set by the application model on construction; `modified` is null until the first update and then set automatically.
- Every row that belongs to an owner carries the owner id. Child tables repeat the owner id and use a composite foreign key `(parent_id, owner_id) REFERENCES parent(id, owner_id)` with ON DELETE CASCADE and an index on the owner id, so a child can never belong to a different owner than its parent.
- Every repository filter on an owned entity requires the owner id. No query may return another owner's rows.
- Every repository exposes the same complete surface: `get` (nullable), `demand` (raises not found), `get_many`, `demand_many`, plus a single and a list data loader, all exported from the data access package index.

## Imports
- Inside one package: relative imports, at most two levels up.
- Across packages: absolute imports.
- Cross-module imports go through the module's public index, never into its internals. The index is the public API.
- Test files always use absolute imports.

## Comments
- Comments are a last resort. Code explains itself through naming, structure, and small functions.
- Remove section dividers, docstrings that restate the file name, and comments that restate the next line.
- Keep "why" comments for non-obvious business logic, warnings about traps, Arrange/Act/Assert markers in tests, and TODOs that carry a ticket reference.

## Testing
- Test directories sit next to what they test. Unit tests are for pure logic only. Everything with dependencies is an integration test wired through the test DI container.
- Never use mocking libraries (no `unittest.mock`, `jest.mock`, `vi.mock`, spies, or call-count assertions). Write sociable, state-based tests: run the real use case with real components and in-memory fakes at the infrastructure boundary, then assert on outputs and resulting state.
- Every use case and every business component is fully tested before it is committed.
- Infrastructure wrappers that talk to real external systems get narrow integration tests against a sandbox; everything above them tests against fakes.
- Overlapping coverage is intended: one bug may fail several tests, and that is a feature.

## Quality gate (runs before every commit, all must pass)
1. Format: `yarn format`
2. Lint and strict type check: `yarn lint`
3. Tests: `yarn test`
4. Any generated schema or client code is regenerated and committed.

Never describe work as done, ready, or passing unless these were actually run in this session and actually passed. If something fails, report the output.

## Review gate (runs before every pull request)
- Commit first, so review tampering is visible and recoverable.
- Run a two-axis review on the diff against the base branch, as two read-only reviews with fresh context:
  - Standards: every place the diff violates `CLAUDE.md` or an ADR, citing the rule. Hard violations separated from judgement calls. Skip what tooling already enforces.
  - Spec: requirements asked for but missing or partial, behaviour nobody asked for, and requirements that look implemented but are wrong, quoting the originating request for each.
- Report the two axes separately; never merge or rerank them, because code can pass one and fail the other.
- Reviewers are judgement only: they may read files and run read-only commands, and they never edit, format, or run any git command that mutates state.
- Fix every correctness or safety finding and re-run the gate. Polish-only findings may ship. After fixing, re-read the critical lines rather than trusting that they survived.
- Run a second round after structural fixes. Second rounds find defects first rounds cannot see.

## Git and pull requests
- Never commit directly to the main branch. One branch per change, branched from an up-to-date main.
- One pull request per coherent change, one commit per logical step, so the log reads like a table of contents.
- Commit messages describe the behaviour change in the imperative. No co-author trailers, no tool or assistant attribution of any kind.
- Format, lint, and test before every push.
- A required check that is skipped, cancelled, or pending counts as failed. Only a green success is a pass.
- Before pushing follow-up commits, check whether the pull request already merged; if it did, branch again from main.
- Finish the committed scope. Do not stop halfway with TODOs or "shall I continue?" questions. If something is blocked, finish everything else and say exactly what was left out and why.

## Writing style (chat, commits, docs, comments)
- Never use em dashes or en dashes. Use a comma, a colon, parentheses, or a new sentence.
- Lead with the outcome. State facts; do not narrate your own reasoning.
- Say plainly what was verified and what was not.

## Package management
- Use the single package manager chosen for the stack and never mix in another.

## Language notes: TypeScript

* Package manager: `yarn`. Never `npm`.
* Format and lint with Biome and ESLint through one script (`yarn format`, `yarn lint`); never run Prettier directly. Type check with `tsc --noEmit` under `strict: true`.
* Prefer `function` declarations over arrow functions at module level so hoisting allows top-down ordering.
* String literal unions instead of `enum`.
* If using GraphQL with Apollo Client: no `refetchQueries`, no cache manipulation in components or hooks, all cache behaviour in `InMemoryCache` type policies; queries live in the component that uses them, only fragments are exported, and a query and a mutation on the same type share a fragment.
