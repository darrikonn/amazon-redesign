import { describe, expect, it } from "vitest";
import { DataLoader } from "@/infrastructure";

function recordingLoader() {
  const batches: (readonly number[])[] = [];
  const loader = new DataLoader<number, string>(async (keys) => {
    batches.push(keys);
    return keys.map((key) => `value-${key}`);
  });
  return { loader, batches };
}

describe("DataLoader", () => {
  it("batches loads made in the same tick", async () => {
    // Arrange
    const { loader, batches } = recordingLoader();

    // Act
    const values = await Promise.all([loader.load(1), loader.load(2)]);

    // Assert
    expect(values).toEqual(["value-1", "value-2"]);
    expect(batches).toEqual([[1, 2]]);
  });

  it("serves a repeated key from its cache", async () => {
    // Arrange
    const { loader, batches } = recordingLoader();

    // Act
    await loader.load(1);
    await loader.load(1);

    // Assert
    expect(batches).toEqual([[1]]);
  });

  it("starts a new batch on a later tick", async () => {
    // Arrange
    const { loader, batches } = recordingLoader();

    // Act
    await loader.load(1);
    await loader.load(2);

    // Assert
    expect(batches).toEqual([[1], [2]]);
  });

  it("rejects every load in a failed batch", async () => {
    const loader = new DataLoader<number, string>(async () => {
      throw new Error("backend down");
    });

    await expect(Promise.all([loader.load(1), loader.load(2)])).rejects.toThrow("backend down");
  });

  it("retries a key after its batch failed", async () => {
    // Arrange
    let attempts = 0;
    const loader = new DataLoader<number, string>(async (keys) => {
      attempts += 1;
      if (attempts === 1) throw new Error("backend down");
      return keys.map((key) => `value-${key}`);
    });
    await expect(loader.load(1)).rejects.toThrow("backend down");

    // Act
    const value = await loader.load(1);

    // Assert
    expect(value).toBe("value-1");
  });

  it("rejects when the batch returns the wrong number of values", async () => {
    const loader = new DataLoader<number, string>(async () => ["only one"]);

    await expect(Promise.all([loader.load(1), loader.load(2)])).rejects.toThrow(
      "Batch returned 1 values for 2 keys",
    );
  });
});
