import { describe, expect, it } from "vitest";
import { returnStatus } from "@/app/_ui/return-status";
import type { OrderLineView } from "@/use-case";

const line: OrderLineView = {
  productId: "lamp",
  name: "Lamp",
  category: "laptops",
  image: null,
  priceInCents: 1_000,
  quantity: 1,
  returnState: "returnable",
  returnableUntil: "2026-11-11T12:00:00.000Z",
};

describe("returnStatus", () => {
  it("says what can still be done with a line", () => {
    expect(returnStatus({ ...line, returnState: "returned" })).toBe("Return started");
    expect(returnStatus({ ...line, returnState: "never-returnable" })).toBe("Not returnable");
    expect(returnStatus({ ...line, returnState: "returnable-once-delivered" })).toBe(
      "Returnable once delivered",
    );
    expect(returnStatus(line)).toBe("Return by 11 Nov 2026");
    expect(returnStatus({ ...line, returnState: "window-closed" })).toBe("Return window closed");
  });
});
