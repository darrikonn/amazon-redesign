import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/core";
import { KeyedRecords } from "@/infrastructure";

const records = new KeyedRecords(
  "lamp",
  new Map([
    ["desk", { name: "Desk lamp" }],
    ["floor", { name: "Floor lamp" }],
  ]),
);

describe("KeyedRecords", () => {
  it("finds records by key, in the order asked, and skips missing ones in getMany", () => {
    expect(records.get("desk")).toEqual({ name: "Desk lamp" });
    expect(records.get("wall")).toBeNull();
    expect(records.getMany(["floor", "wall", "desk"])).toEqual([
      { name: "Floor lamp" },
      { name: "Desk lamp" },
    ]);
    expect(records.values()).toHaveLength(2);
  });

  it("names the missing record when it is demanded", () => {
    expect(() => records.demand("wall")).toThrow(NotFoundError);
    expect(() => records.demandMany(["desk", "wall"])).toThrow("lamp not found: wall");
  });
});
