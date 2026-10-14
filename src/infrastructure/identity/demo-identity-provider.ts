import type { IdentityProvider, Shopper } from "@/core";

export const DEMO_SHOPPER: Shopper = {
  id: "shopper-darri",
  firstName: "Darri",
  deliveryCity: "Minneapolis",
  deliveryPostalCode: "55401",
};

export class DemoIdentityProvider implements IdentityProvider {
  async currentShopper(): Promise<Shopper> {
    return DEMO_SHOPPER;
  }
}
