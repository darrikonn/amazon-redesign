import { GUEST_SHOPPER_ID, shopperFromSession } from "@/component";
import type { SessionStore, Shopper, ShopperId } from "@/core";

export async function currentShopper(sessions: SessionStore): Promise<Shopper | null> {
  const session = await sessions.current();
  return session === null ? null : shopperFromSession(session);
}

// A signed-out visitor still has a cart; it belongs to the guest (ADR 0030).
export function cartOwnerOf(shopper: Shopper | null): ShopperId {
  return shopper?.id ?? GUEST_SHOPPER_ID;
}
