import { GUEST_SHOPPER_ID, shopperFromSession, validSession } from "@/component";
import type { SessionStore, Shopper, ShopperId } from "@/core";

// The cookie comes back from the visitor's browser, so it is checked again on every read:
// one that SignIn could not have made counts as signed out.
export async function currentShopper(sessions: SessionStore): Promise<Shopper | null> {
  const stored = await sessions.current();
  const session = stored === null ? null : validSession(stored);
  return session === null ? null : shopperFromSession(session);
}

// A signed-out visitor still has a cart; it belongs to the guest (ADR 0030).
export function cartOwnerOf(shopper: Shopper | null): ShopperId {
  return shopper?.id ?? GUEST_SHOPPER_ID;
}
