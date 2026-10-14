# 0018. The data layer and sign-in are faked behind real ports

## Status

Accepted (2026-10-14). Amended by ADR 0030: sign-in, the cart, orders, and the saved list.

## Context

The storefront redesign has no backend: no catalog service, no cart service, and no identity provider. The product still needs a catalog to search, a cart that remembers what was added, and a signed-in shopper for the header ("Hello, Darri"). When real services arrive they must replace the fakes without touching use cases or the UI.

## Decision

Core defines the ports as if the services were real: `ProductRepository`, `ProductDetailsRepository`, `CartLineRepository`, `OrderRepository`, `SavedItemRepository`, `SessionStore`, and `Clock`. Each data port is asynchronous, and every cart, order, and list method takes the owner id (ADR 0012). The test fakes record their calls and expose seeding helpers and `reset()`; the production and local adapters do not record anything.

Bindings per container (ADR 0005):

| Port | Production and local | Test |
| --- | --- | --- |
| `ProductRepository` | `CatalogProductRepository`, reading the generated `catalog.json` (ADR 0025) | `InMemoryProductRepository`, empty until seeded |
| `ProductDetailsRepository` | `CatalogProductDetailsRepository`, importing the generated `product-details.json` on first use (ADR 0029) | `InMemoryProductDetailsRepository`, empty until seeded |
| `CartLineRepository` | `StoredCartLineRepository`, in the browser's storage (ADR 0030) | `InMemoryCartLineRepository` |
| `OrderRepository` | `StoredOrderRepository`, in the browser's storage | `InMemoryOrderRepository` |
| `SavedItemRepository` | `StoredSavedItemRepository`, in the browser's storage | `InMemorySavedItemRepository` |
| `SessionStore` | `BrowserSessionStore` in the browser, `RequestSessionStore` on the server, both over the session cookie (ADR 0030) | `InMemorySessionStore`, signed out until seeded |
| `Clock` | `SystemClock` | `FixedClock`, standing at 2026-10-14 12:00 UTC until moved |

The search assistant is simulated in process and needs no binding (ADR 0026).

The production and local containers are identical today. They stay separate factories so a real adapter replaces one line in one factory.

The cart, orders, and list live in the visitor's browser, so they are never shared between visitors. The server reads only the session cookie, and never reads or writes a cart.

## Consequences

Persistence is per browser: reloading keeps the cart, orders, and list, but another device starts fresh. Replacing a fake is an infrastructure change plus a composition change, with no edits to core, components, use cases, or delivery. The repository surface rules (get, demand, get many, demand many, and data loaders) apply to these repositories even though no database exists yet, so the shape does not change when one does.
