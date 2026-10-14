# 0018. The data layer and sign-in are faked behind real ports

## Status

Accepted (2026-10-14)

## Context

The storefront redesign has no backend: no catalog service, no cart service, and no identity provider. The product still needs a catalog to search, a cart that remembers what was added, and a signed-in shopper for the header ("Hello, Darri"). When real services arrive they must replace the fakes without touching use cases or the UI.

## Decision

Core defines the ports as if the services were real: `ProductRepository`, `CartLineRepository`, and `IdentityProvider`. Each is asynchronous, and every cart method takes the owner id (ADR 0012). The test fakes record their calls and expose seeding helpers and `reset()`; the production and local adapters do not record anything.

Bindings per container (ADR 0005):

| Port | Production and local | Test |
| --- | --- | --- |
| `ProductRepository` | `CatalogProductRepository`, reading the bundled catalog in `src/infrastructure/product/catalog.ts` | `InMemoryProductRepository`, empty until seeded |
| `CartLineRepository` | `SessionCartLineRepository`, one per container | `InMemoryCartLineRepository` |
| `IdentityProvider` | `DemoIdentityProvider`, always signed in as the demo shopper | `InMemoryIdentityProvider`, seeded per test |

The production and local containers are identical today. They stay separate factories so a real adapter replaces one line in one factory.

The cart lives in the container that the browser creates, so it lasts for the page session and is never shared between visitors. The server never reads or writes a cart.

## Consequences

There is no persistence: reloading the page empties the cart. Replacing a fake is an infrastructure change plus a composition change, with no edits to core, components, use cases, or delivery. The repository surface rules (get, demand, get many, demand many, and data loaders) apply to these repositories even though no database exists yet, so the shape does not change when one does.
