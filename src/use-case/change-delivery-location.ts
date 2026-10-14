import { normalisePostalCode, shopperFromSession } from "@/component";
import type { SessionStore } from "@/core";
import { currentShopper } from "./session-shopper";
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
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return { status: "signed-out" };
    const postalCode = normalisePostalCode(request.postalCode);
    if (postalCode === null) return { status: "invalid-postal-code" };
    const updated = { email: shopper.email, deliveryPostalCode: postalCode };
    await this.sessions.save(updated);
    return { status: "changed", shopper: toShopperView(shopperFromSession(updated)) };
  }
}
