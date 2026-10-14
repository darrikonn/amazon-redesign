import { normalisePostalCode, shopperFromSession } from "@/component";
import type { SessionStore } from "@/core";
import { type ShopperView, toShopperView } from "./view-session";

export type ChangeDeliveryLocationRequest = {
  postalCode: string;
};

export type ChangeDeliveryLocationResult =
  | { status: "changed"; shopper: ShopperView }
  | { status: "invalid-postal-code" }
  | { status: "signed-out" };

export class ChangeDeliveryLocation {
  constructor(private readonly sessions: SessionStore) {}

  async execute(request: ChangeDeliveryLocationRequest): Promise<ChangeDeliveryLocationResult> {
    const session = await this.sessions.current();
    if (session === null) return { status: "signed-out" };
    const postalCode = normalisePostalCode(request.postalCode);
    if (postalCode === null) return { status: "invalid-postal-code" };
    const updated = { ...session, deliveryPostalCode: postalCode };
    await this.sessions.save(updated);
    return { status: "changed", shopper: toShopperView(shopperFromSession(updated)) };
  }
}
