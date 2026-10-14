// Everything the fake sign-in remembers (ADR 0030); the shopper's name is derived from
// the email, and the city from the ZIP code.
export type Session = {
  email: string;
  deliveryPostalCode: string;
};
