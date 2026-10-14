import { STARTER_QUERIES } from "@/component";
import type { Category, IdentityProvider } from "@/core";
import { CATEGORIES } from "@/core";

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
      departments: CATEGORIES.map(toDepartment),
    };
  }
}

function toDepartment(category: Category): Department {
  const name = category.pluralName;
  return { label: name.charAt(0).toUpperCase() + name.slice(1), query: name };
}
