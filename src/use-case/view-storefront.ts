import { STARTER_QUERIES } from "@/component";
import type { IdentityProvider } from "@/core";

export type Storefront = {
  shopper: ShopperGreeting;
  starterQueries: readonly string[];
};

export type ShopperGreeting = {
  firstName: string;
  deliveryCity: string;
  deliveryPostalCode: string;
};

export class ViewStorefront {
  constructor(private readonly identity: IdentityProvider) {}

  async execute(): Promise<Storefront> {
    const shopper = await this.identity.currentShopper();
    return {
      shopper: {
        firstName: shopper.firstName,
        deliveryCity: shopper.deliveryCity,
        deliveryPostalCode: shopper.deliveryPostalCode,
      },
      starterQueries: STARTER_QUERIES,
    };
  }
}
