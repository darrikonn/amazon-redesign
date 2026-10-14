import { CATEGORY_MAP, capitalize, LIVE_CATEGORIES, STARTER_QUERIES } from "@/component";
import type { CategoryId, IdentityProvider } from "@/core";

export type Storefront = {
  shopper: ShopperGreeting;
  starterQueries: readonly string[];
  departments: readonly Department[];
};

export type ShopperGreeting = {
  firstName: string;
  deliveryCity: string;
  deliveryPostalCode: string;
};

export type Department = {
  label: string;
  query: string;
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
      departments: LIVE_CATEGORIES.map(toDepartment),
    };
  }
}

function toDepartment(category: CategoryId): Department {
  const plural = CATEGORY_MAP[category].plural;
  return { label: capitalize(plural), query: plural };
}
