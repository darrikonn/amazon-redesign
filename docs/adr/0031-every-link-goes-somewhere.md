# 0031. Every link goes somewhere, and each page has one name

## Status

Accepted (2026-10-15)

## Context

The footer copied Amazon's: Gift Cards, Registry, Prime, Prime Video, Amazon Music, Groceries, Pharmacy, Customer Service, Shipping Rates, and Accessibility. None of those exist in this redesign, so the links went to `#` anchors that did nothing. An address that matched no page showed the framework's default "404" screen, which also broke the dark theme. The same pages were also named differently in different places ("Today's Deals", "Today’s deals"; "Your lists", "Your list").

## Decision

- **Nothing links to a page that does not exist.** The footer lists only the shop's own pages: Shop (today’s deals, buy again, your cart), Your account (account, orders, track an order, your list), and Help.
- **A Help page** (`/help`) answers what the shop actually does: delivery (free, with each product's estimate), returns (each product's own window, started from the order), the account (email-only sign-in, data kept in the browser, a demo with no payment), and accessibility. The footer's Delivery, Returns, and Accessibility links go to its sections.
- **Unknown addresses get the shop's own "Page not found" page**, inside the header and footer, with ways back: start shopping, today’s deals, and help.
- **One list of the shop's places** (`shop-place.ts` in the delivery layer) gives each page its address, name, icon, and description, and the header menu, the home page shortcuts, the account page, and the footer all read from it. Names are written in sentence case, with typographic apostrophes.

## Consequences

The footer is shorter than Amazon's, but every link in it works. A new page gets its name in one place, and every link to it uses that name.
