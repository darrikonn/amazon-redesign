import type { SessionStore, Shopper } from "@/core";
import { currentShopper } from "./session-shopper";

export type ShopperView = {
  email: string;
  firstName: string;
  fullName: string;
  deliveryCity: string | null;
  deliveryPostalCode: string;
};

export type SessionView = {
  shopper: ShopperView | null;
};

export class ViewSession {
  constructor(private readonly sessions: SessionStore) {}

  async execute(): Promise<SessionView> {
    const shopper = await currentShopper(this.sessions);
    return { shopper: shopper === null ? null : toShopperView(shopper) };
  }
}

export function toShopperView(shopper: Shopper): ShopperView {
  return {
    email: shopper.email,
    firstName: shopper.firstName,
    fullName: shopper.fullName,
    deliveryCity: shopper.deliveryCity,
    deliveryPostalCode: shopper.deliveryPostalCode,
  };
}
