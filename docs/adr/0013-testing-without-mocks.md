# 0013. Testing without mocks: sociable, state-based tests with in-memory fakes

## Status

Accepted (2026-10-14)

## Context

Mock-based tests assert on how code was called, so they break on every refactor and pass when behaviour is wrong but the call sequence matches. They also duplicate the collaborator's contract in every test file.

## Decision

No mocking libraries, spies, or call-count assertions: no `vi.mock`, `vi.fn`, `vi.spyOn`, or equivalents. Tests are sociable and state-based:

1. Arrange: build the test container (ADR 0005), seed the in-memory fakes with domain helpers.
2. Act: run the real use case with real components.
3. Assert: check the returned value and the resulting state in the fakes (`calls`, stored entities).

Unit tests cover pure functions directly. Infrastructure adapters that talk to a real external system get narrow integration tests against a sandbox, and nothing above them touches the real system.

Good:

```ts
it("stores the order and sends a confirmation", async () => {
  // Arrange
  const { container, fakes } = createTestContainer();
  fakes.userRepository.seedUser(aUser({ id: "user-1" }));

  // Act
  const result = await container.placeOrder.execute({ ownerId: "user-1", symbol: "ABC", quantity: 2 });

  // Assert
  expect(result.status).toBe("open");
  expect(await fakes.orderRepository.get("user-1", result.id)).toEqual(result);
  expect(fakes.emailSender.calls).toHaveLength(1);
});
```

Bad:

```ts
vi.mock("@/infrastructure/email-sender");
expect(sendMock).toHaveBeenCalledTimes(1);
```

## Consequences

Tests survive refactors that keep behaviour. One bug may fail several tests; that overlap is intended. Fakes must be faithful to the port, which is why they live beside the real adapter and are reviewed with it.
