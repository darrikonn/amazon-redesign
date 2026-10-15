import { describe, expect, it } from "vitest";
import { availabilityFrom } from "@/component";

describe("availabilityFrom", () => {
  it("reads the source's three stock states and nothing else", () => {
    expect(availabilityFrom("In Stock")).toBe("in-stock");
    expect(availabilityFrom("Low Stock")).toBe("low-stock");
    expect(availabilityFrom("Out of Stock")).toBe("out-of-stock");
    expect(availabilityFrom("Discontinued")).toBeNull();
    expect(availabilityFrom(null)).toBeNull();
  });
});
