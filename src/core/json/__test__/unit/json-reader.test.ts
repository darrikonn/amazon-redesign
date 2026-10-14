import { describe, expect, it } from "vitest";
import {
  isRecord,
  optionalString,
  requireArray,
  requireNumber,
  requireRecord,
  requireString,
  requireStringArray,
} from "@/core";

describe("json readers", () => {
  it("tells objects from arrays and null", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });

  it("returns values of the expected type", () => {
    const record = requireRecord({ name: "Bag", price: 12, tags: ["a"], brand: null }, "product");

    expect(requireString(record, "name", "product")).toBe("Bag");
    expect(requireNumber(record, "price", "product")).toBe(12);
    expect(requireStringArray(record, "tags", "product")).toEqual(["a"]);
    expect(optionalString(record, "brand", "product")).toBeNull();
    expect(requireArray([1], "list")).toEqual([1]);
  });

  it("names the context and the field when a value has the wrong type", () => {
    const record = requireRecord({ name: 4, price: Number.NaN, tags: ["a", 2] }, "product");

    expect(() => requireString(record, "name", "product")).toThrow(
      'product: expected "name" to be a string',
    );
    expect(() => requireNumber(record, "price", "product")).toThrow('"price" to be a number');
    expect(() => requireStringArray(record, "tags", "product")).toThrow(
      '"tags[1]" is not a string',
    );
    expect(() => requireRecord([], "product")).toThrow("product: expected an object");
  });
});
