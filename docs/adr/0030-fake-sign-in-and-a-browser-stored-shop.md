# 0030. A fake sign-in, and the shop's account data kept in the browser

## Status

Accepted (2026-10-14)

## Context

The header's account items (Deliver to, Account & Lists, Returns & Orders, Cart) and the home page shortcuts (Buy again, Track an order, Today's deals) led nowhere, and the shopper was always the same demo person. The redesign has no backend (ADR 0018), but these features need a signed-in shopper, a cart that survives moving between pages and reloading, orders that can be tracked and returned, and a saved list.

## Decision

- **Sign-in takes only an email.** There is no password and no account check; any well-formed address signs in. The shopper's name comes from the address: the part before the `@`, without a `+tag`, split on dots, underscores, and hyphens, digits dropped, each word capitalised (`darri.konn@gmail.com` is Darri Konn, greeted as Darri). The rules are pure code in the `shopper-account` component.
- **The session is a cookie holding the email and the delivery ZIP code**, nothing else. It is not a secret and grants nothing; it lets the server render "Hello, Darri" on the first response (ADR 0019) and send signed-out visitors from account pages to sign-in. The `SessionStore` port replaces `IdentityProvider`. The browser never writes the cookie itself (the lint rules forbid `document.cookie` assignments, and a server-set cookie is the realistic shape anyway): `BrowserSessionStore` reads it and calls `PUT` or `DELETE /api/session` to change it. That route gets the container and calls the `RememberSession` use case (which checks the email and ZIP code again) or `SignOut`, and `RequestSessionStore` writes the cookie through the framework's request cookies. On a page render the same store only reads. `InMemorySessionStore` is the test fake.
- **Everything else lives in the browser's `localStorage`**: cart lines (now with a quantity), orders with their returns, and the saved list, each keyed by the owner id (ADR 0012). The repositories (`StoredCartLineRepository`, `StoredOrderRepository`, `StoredSavedItemRepository`) sit on a small `KeyValueStorage` adapter whose fake records its calls. Data stays on the visitor's device and is never sent anywhere.
- **Visitors can shop before signing in.** A signed-out cart belongs to the guest owner; signing in moves it into the shopper's cart. Checkout, orders, returns, buy again, and the list need a signed-in shopper.
- **A new shopper gets three demo orders** on first sign-in, picked deterministically from the catalogue by the email (one delivered weeks ago, one delivered days ago, one still on its way), so Buy again, Track an order, and Returns have something to show. They behave exactly like placed orders, and each is marked "Sample order" so nobody mistakes it for a purchase.
- **Orders are snapshots.** Placing an order copies each line's name, price, quantity, and return window (read from the product's return policy, so "No return policy" means the line cannot be returned) into the order, with the delivery ZIP code. The photo and the city are not stored, since either may be missing and stored fields may not be empty (ADR 0007): they are looked up when the order is shown. Cart lines, orders, and saved items carry `created`, and `modified`, which the repository sets when a record is saved again. Tracking (ordered, shipped, out for delivery, delivered) is computed from the order date, the delivery estimate, and the current time by pure rules in the `order-history` component; a `Clock` port makes time injectable and testable.
- **Returns** can be started for delivered lines inside their return window, once each, with a reason from a fixed list.
- **Today's deals** are the catalogue's discounted products (DummyJSON's `discountPercentage`, kept in the catalogue as a whole percentage), a fixed number per day chosen deterministically from the date, so the page changes daily but every visitor sees the same deals that day. Prices stay the catalogue's prices; the list price shown struck through is derived from the discount.
- **Pages**: `/sign-in`, `/account`, `/orders` (and `/orders/<id>` with tracking and returns), `/cart` (with checkout), `/buy-again`, `/deals`, and `/lists`. One client shell in the root layout holds the container, the session, the cart count, and the product modal, so they persist while moving between pages.

## Consequences

The account features work end to end with no server state, so the app still deploys as a static-plus-server Next.js app with nothing to provision. Data is per browser: another device, or cleared site data, starts fresh. Because names are guessed from addresses, `jdoe@x.com` greets "Jdoe". Replacing the fakes with real services is an infrastructure and composition change: the ports, use cases, and pages stay.
