import { describe, expect, it } from "vitest";
import {
  helpHref,
  isJustPlaced,
  orderHref,
  orderListHref,
  orderReturnHref,
  SHOP_PLACES,
} from "@/app/_ui/shop-place";

describe("shop addresses", () => {
  it("names an order's page, its return form, and the visit right after checkout", () => {
    expect(orderHref("order-1")).toBe("/orders/order-1");
    expect(orderHref("order-1", { isJustPlaced: true })).toBe("/orders/order-1?placed=1");
    expect(orderReturnHref("order-1")).toBe("/orders/order-1#return");
    expect(isJustPlaced("1")).toBe(true);
    expect(isJustPlaced(undefined)).toBe(false);
  });

  it("lists all orders, or a filter of them, the way the track-an-order place does", () => {
    expect(orderListHref("all")).toBe("/orders");
    expect(orderListHref("on-the-way")).toBe(SHOP_PLACES.trackOrder.href);
  });

  it("points at a help topic", () => {
    expect(helpHref("returns")).toBe("/help#returns");
  });
});
