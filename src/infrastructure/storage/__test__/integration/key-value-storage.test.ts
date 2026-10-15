import { describe, expect, it } from "vitest";
import { BrowserKeyValueStorage, InMemoryKeyValueStorage } from "@/infrastructure";

describe("BrowserKeyValueStorage", () => {
  it("keeps values in memory where there is no localStorage, as on the server", () => {
    // Arrange
    const storage = new BrowserKeyValueStorage();

    // Act
    storage.write("key", { count: 2 });

    // Assert
    expect(storage.read("key")).toEqual({ count: 2 });
    expect(storage.read("missing")).toBeNull();
    storage.remove("key");
    expect(storage.read("key")).toBeNull();
  });
});

describe("InMemoryKeyValueStorage", () => {
  it("records calls and forgets everything on reset", () => {
    // Arrange
    const storage = new InMemoryKeyValueStorage();
    storage.write("key", 1);
    storage.read("key");

    // Act
    const recorded = [...storage.calls];
    storage.reset();

    // Assert
    expect(recorded).toEqual([
      { method: "write", key: "key" },
      { method: "read", key: "key" },
    ]);
    expect(storage.calls).toEqual([]);
    expect(storage.storedValue("key")).toBeNull();
  });
});
