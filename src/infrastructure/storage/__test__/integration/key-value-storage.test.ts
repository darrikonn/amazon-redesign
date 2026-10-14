import { describe, expect, it } from "vitest";
import { requireRecord, requireString } from "@/core";
import {
  BrowserKeyValueStorage,
  InMemoryKeyValueStorage,
  StoredCollection,
} from "@/infrastructure";

type Note = { ownerId: string; text: string };

function parseNote(value: unknown, context: string): Note {
  const record = requireRecord(value, context);
  return {
    ownerId: requireString(record, "ownerId", context),
    text: requireString(record, "text", context),
  };
}

describe("StoredCollection", () => {
  it("keeps each owner's list under its own key", () => {
    // Arrange
    const storage = new InMemoryKeyValueStorage();
    const notes = new StoredCollection(storage, "notes", parseNote);

    // Act
    notes.replace("robin", [{ ownerId: "robin", text: "hello" }]);

    // Assert
    expect(notes.list("robin")).toEqual([{ ownerId: "robin", text: "hello" }]);
    expect(notes.list("sam")).toEqual([]);
    expect(storage.storedValue("shop:v2:notes:robin")).toEqual([
      { ownerId: "robin", text: "hello" },
    ]);
  });

  it("reads a list that no longer parses as empty", () => {
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v2:notes:robin", [{ ownerId: "robin", text: 4 }]);
    storage.seedValue("shop:v2:notes:kim", [{ ownerId: "sam", text: "not kim's" }]);
    storage.seedValue("shop:v2:notes:sam", { not: "a list" });
    const notes = new StoredCollection(storage, "notes", parseNote);

    expect(notes.list("robin")).toEqual([]);
    expect(notes.list("sam")).toEqual([]);
    expect(notes.list("kim")).toEqual([]);
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
