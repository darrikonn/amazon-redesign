import {
  GUEST_SHOPPER_ID,
  normaliseEmail,
  normalisePostalCode,
  shopperFromSession,
} from "@/component";
import type { SessionStore, Shopper, ShopperId } from "@/core";

// The cookie comes back from the visitor's browser, so it is checked again on every read:
// one that SignIn could not have made counts as signed out.
export async function currentShopper(sessions: SessionStore): Promise<Shopper | null> {
  const session = await sessions.current();
  if (session === null) return null;
  const email = normaliseEmail(session.email);
  const deliveryPostalCode = normalisePostalCode(session.deliveryPostalCode);
  if (email === null || deliveryPostalCode === null) return null;
  return shopperFromSession({ email, deliveryPostalCode });
}

// A signed-out visitor still has a cart; it belongs to the guest (ADR 0030).
export function cartOwnerOf(shopper: Shopper | null): ShopperId {
  return shopper?.id ?? GUEST_SHOPPER_ID;
}
