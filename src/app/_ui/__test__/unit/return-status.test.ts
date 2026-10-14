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
  isReturnable: false,
  isReturned: false,
  returnableUntil: "2026-11-11T12:00:00.000Z",
};

describe("returnStatus", () => {
  it("says what can still be done with a line", () => {
    expect(returnStatus({ ...line, isReturned: true }, "delivered")).toBe("Return started");
    expect(returnStatus({ ...line, returnableUntil: null }, "delivered")).toBe("Not returnable");
    expect(returnStatus(line, "shipped")).toBe("Returnable once delivered");
    expect(returnStatus({ ...line, isReturnable: true }, "delivered")).toBe(
      "Return or replace by 11 Nov 2026",
    );
    expect(returnStatus(line, "delivered")).toBe("Return window closed");
  });
});
