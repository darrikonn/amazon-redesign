import { describe, expect, it } from "vitest";
import { requireRecord, requireString } from "@/core";
import { InMemoryKeyValueStorage, StoredCollection } from "@/infrastructure";

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

  it("skips a row that no longer parses and keeps the rest", () => {
    // Arrange
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v2:notes:robin", [
      { ownerId: "robin", text: 4 },
      { ownerId: "robin", text: "kept" },
    ]);
    const notes = new StoredCollection(storage, "notes", parseNote);

    // Act
    notes.upsert(
      { ownerId: "robin", text: "new" },
      (stored) => stored.text === "new",
      () => ({ ownerId: "robin", text: "new" }),
    );

    // Assert
    expect(notes.list("robin")).toEqual([
      { ownerId: "robin", text: "kept" },
      { ownerId: "robin", text: "new" },
    ]);
  });

  it("reads something that is not a list, or another owner's rows, as empty", () => {
    const storage = new InMemoryKeyValueStorage();
    storage.seedValue("shop:v2:notes:kim", [{ ownerId: "sam", text: "not kim's" }]);
    storage.seedValue("shop:v2:notes:sam", { not: "a list" });
    const notes = new StoredCollection(storage, "notes", parseNote);

    expect(notes.list("sam")).toEqual([]);
    expect(notes.list("kim")).toEqual([]);
  });
});
