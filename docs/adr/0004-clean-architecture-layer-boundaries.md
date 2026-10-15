# 0004. Clean Architecture layer boundaries

## Status

Accepted (2026-10-14)

## Context

Without an explicit dependency direction, a Next.js route handler ends up importing a database client, a component reaches for `fetch`, and tests need the real world to run. The project needs a fixed set of layers and a rule for what each may import.

## Decision

Dependencies point inward. Infrastructure implements core interfaces and is injected by a composition root. Layers and their directories:

| Layer | Directory | May import | Must not import |
| --- | --- | --- | --- |
| Core | `src/core` | Standard library only. Defines entities, value types, and ports (interfaces), and the small JSON readers (`requireString`, `requireRecord`) that every layer uses to check untrusted data before it becomes a value type; they live here because components may import only core. | Anything from other layers or from `node_modules`. |
| Business component | `src/component` | `src/core` | Use cases, delivery, infrastructure, composition. |
| Use case | `src/use-case` | `src/core`, `src/component` | Delivery, infrastructure, composition. |
| Infrastructure | `src/infrastructure` | `src/core`, external packages | Components, use cases, delivery, composition. |
| Delivery | `src/app` (Next.js routes, server actions, pages) | `src/composition` (only to obtain the container), `src/use-case` types, `src/core` types | Components, repositories, data loaders, infrastructure. |
| Composition root | `src/composition` and the test bootstrap | Every layer | Nothing is forbidden; this is the only wiring point. |

Use cases and components contain no raw SQL and no raw external API calls. Custom queries live in a dedicated data service port in core, implemented in infrastructure, and injected. Pure calculation code has no side effects, no I/O, and depends only on the standard library.

Good:

```ts
// src/app/api/order/route.ts
import { getContainer } from "@/composition";

export async function POST(request: Request) {
  const { placeOrder } = getContainer();
  return Response.json(await placeOrder.execute(await request.json()));
}
```

Bad:

```ts
// src/app/api/order/route.ts
import { sql } from "@/infrastructure/database/client";
import { OrderRepository } from "@/infrastructure/order-repository";

export async function POST(request: Request) {
  const repository = new OrderRepository(sql);
  ...
}
```

The rule is checked by `yarn lint`. `eslint.config.ts` forbids each layer the layers this table forbids, by alias and by relative path alike, plus `@/test-support` everywhere outside tests, the frameworks and `node:` modules in core, components, and use cases, and any import into another layer's files rather than its index. Delivery may import only types from `@/use-case` and `@/core`, and only `createContainer` from `@/composition`. Tests are exempt: unit tests import only what they test, and the rest are wired through the test container, a composition root.

## Consequences

Every external system is replaceable behind a port. Tests above infrastructure run without the real world (ADR 0013). A new dependency on an outer layer is a review finding under the Standards axis (ADR 0015).
