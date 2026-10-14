# 0006. Business constants live in components

## Status

Accepted (2026-10-14)

## Context

Thresholds, limits, percentages, and retry counts are business rules. Putting them in settings or environment variables hides them from the code that depends on them, lets environments silently diverge, and makes a rule change untraceable in version control.

## Decision

A business rule value is a named constant on the component that uses it. It is not a setting, not an environment variable, and not a container parameter. Changing the rule is a code change with a commit message.

Good:

```ts
export class OrderValidator {
  static readonly MINIMUM_QUANTITY = 1;
  static readonly MAXIMUM_NOTIONAL = 1_000_000;

  validate(order: Order): ValidationResult {
    if (order.quantity < OrderValidator.MINIMUM_QUANTITY) return invalid("quantity below minimum");
    ...
  }
}
```

Bad:

```ts
const minimumQuantity = Number(process.env.MIN_QTY ?? "1");
```

## Consequences

Business rules are greppable and reviewed. If a rule genuinely needs to vary per customer, that is domain data stored with the owner, not configuration.
