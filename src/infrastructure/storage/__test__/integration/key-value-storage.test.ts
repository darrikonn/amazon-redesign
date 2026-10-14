import { describe, expect, it } from "vitest";
import { requireRecord, requireString } from "@/core";
import {
  BrowserKeyValueStorage,
  InMemoryKeyValueStorage,
  StoredCollection,
} from "@/infrastructure";

function parseNote(value: unknown, context: string): { text: string } {
  return { text: requireString(requireRecord(value, context), "text", context) };
}

describe("StoredCollection", () => {
  it("keeps each owner's list under its own key", () => {
    // Arrange
    const storage = new InMemoryKeyValueStorage();
    const notes = new StoredCollection(storage, "notes", parseNote);

    // Act
    notes.replace("robin", [{ text: "hello" }]);

    // Assert
    expect(notes.list("robin")).toEqual([{ text: "hello" }]);
    expect(notes.list("sam")).toEqual([]);
    expect(storage.storedValue("shop:v1:notes:robin")).toEqual([{ text: "hello" }]);
  });

  it("reads a list that no longer parses as empty", () => {
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v1:notes:robin", [{ text: 4 }]);
    storage.seedValue("shop:v1:notes:sam", { not: "a list" });
    const notes = new StoredCollection(storage, "notes", parseNote);

    expect(notes.list("robin")).toEqual([]);
    expect(notes.list("sam")).toEqual([]);
  });
});

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
