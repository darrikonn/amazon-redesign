# 0001. Organize code using the Stepdown Rule

## Status

Accepted (2026-10-14)

## Context

Readers open a file to find out what it does, not how every helper works. When helpers come first, the reader scrolls past details before reaching the point. TypeScript `function` declarations are hoisted, so callers can sit above callees without any cost.

## Decision

Every file reads top-down. Public entry points come first. Each function is followed by the functions it calls, in order of first use, one level of abstraction at a time. Module-level functions are `function` declarations, not arrow functions assigned to `const`, so hoisting allows this order. Functions are small and named after their intent; a function that needs a comment to be understood is split or renamed.

Good:

```ts
export function settleOrder(order: Order, clock: Clock): SettledOrder {
  const fee = calculateFee(order);
  return markSettled(order, fee, clock.now());
}

function calculateFee(order: Order): number {
  return order.quantity * order.price * FEE_RATE;
}

function markSettled(order: Order, fee: number, settledAt: Date): SettledOrder {
  return { ...order, fee, settledAt };
}
```

Bad:

```ts
const markSettled = (order: Order, fee: number, settledAt: Date) => ({ ...order, fee, settledAt });
const calculateFee = (order: Order) => order.quantity * order.price * FEE_RATE;

export const settleOrder = (order: Order, clock: Clock) =>
  markSettled(order, calculateFee(order), clock.now());
```

## Consequences

Files are skimmable from the top. Reviewers can stop reading when they reach the level of detail they need. Arrow functions remain fine for callbacks and inline lambdas, but not for module-level definitions.
