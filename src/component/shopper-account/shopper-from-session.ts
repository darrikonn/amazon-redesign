import type { Session, Shopper, ShopperId } from "@/core";
import { deliveryCityFor } from "./delivery-area";
import { nameFromEmail } from "./email-name";

// Whoever shops before signing in; their cart moves to the shopper on sign-in (ADR 0030).
export const GUEST_SHOPPER_ID: ShopperId = "guest";

export function shopperFromSession(session: Session): Shopper {
  const name = nameFromEmail(session.email);
  return {
    id: shopperIdFor(session.email),
    email: session.email,
    firstName: name.firstName,
    fullName: name.fullName,
    deliveryCity: deliveryCityFor(session.deliveryPostalCode),
    deliveryPostalCode: session.deliveryPostalCode,
  };
}

export function shopperIdFor(email: string): ShopperId {
  return `shopper:${email}`;
}
