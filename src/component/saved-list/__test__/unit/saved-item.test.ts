import { describe, expect, it } from "vitest";
import { newSavedItem } from "@/component";

describe("newSavedItem", () => {
  it("is created now and unchanged so far", () => {
    expect(newSavedItem("robin", "lamp", new Date("2026-10-14T15:00:00.000Z"))).toEqual({
      ownerId: "robin",
      productId: "lamp",
      created: "2026-10-14T15:00:00.000Z",
      modified: null,
    });
  });
});
