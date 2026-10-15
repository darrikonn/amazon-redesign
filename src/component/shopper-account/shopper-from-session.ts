import type { Session, Shopper, ShopperId } from "@/core";
import { deliveryCityFor, normalisePostalCode } from "./delivery-area";
import { nameFromEmail, normaliseEmail } from "./email-name";

// Whoever shops before signing in; their cart moves to the shopper on sign-in (ADR 0030).
export const GUEST_SHOPPER_ID: ShopperId = "guest";

// A session as SignIn makes it: a real email and ZIP code, tidied. Anything else (a cookie
// edited by hand, a request made up) is no session at all.
export function validSession(candidate: Session): Session | null {
  const email = normaliseEmail(candidate.email);
  const deliveryPostalCode = normalisePostalCode(candidate.deliveryPostalCode);
  if (email === null || deliveryPostalCode === null) return null;
  return { email, deliveryPostalCode };
}

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

function shopperIdFor(email: string): ShopperId {
  return `shopper:${email}`;
}
