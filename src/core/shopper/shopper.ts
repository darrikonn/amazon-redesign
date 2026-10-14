export type ShopperId = string;

export type Shopper = {
  id: ShopperId;
  email: string;
  firstName: string;
  fullName: string;
  // Null for a ZIP code the fake shop knows no city for.
  deliveryCity: string | null;
  deliveryPostalCode: string;
};
