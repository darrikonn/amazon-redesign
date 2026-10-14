# 0010. Relative imports inside a package, absolute across packages, public index as the boundary

## Status

Accepted (2026-10-14)

## Context

Deep relative paths (`../../../core/...`) break on every move. Importing another module's internal file couples callers to its layout and defeats the layer rules in ADR 0004.

## Decision

- Inside one package (one directory subtree with an `index.ts`): relative imports, at most two levels up (`./x`, `../x`, `../../x`). Deeper than that means the file is in the wrong place.
- Across packages: absolute imports through the `@/` alias (`@/core`, `@/use-case`).
- Cross-module imports go through the module's `index.ts`. The index is the public API; anything not exported from it is private.
- Test files always use absolute imports, including for the file under test.

Good:

```ts
// src/use-case/place-order.ts
import type { Order, OrderRepository } from "@/core";
import { OrderValidator } from "@/component";
import { toConfirmation } from "./confirmation";
```

Bad:

```ts
import { OrderValidator } from "../component/order/order-validator";
import { Order } from "../../core/order/order";
```

## Consequences

Moving a file inside its package touches nothing outside it. Review can check boundaries by looking at import paths alone. A package grows an `index.ts` the moment anything outside it needs it.
