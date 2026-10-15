import {
  DEFAULT_POSTAL_CODE,
  GUEST_SHOPPER_ID,
  mergeIntoCart,
  normaliseEmail,
  normalisePostalCode,
  shopperFromSession,
} from "@/component";
import type { CartLineRepository, Clock, SessionStore, Shopper } from "@/core";
import type { SampleOrderSeeder } from "./sample-order-seeder";
import { type ShopperView, toShopperView } from "./view-session";

export type SignInRequest = {
  email: string;
};

export type SignInResult =
  | { status: "signed-in"; shopper: ShopperView }
  | { status: "invalid-email" };

// Any well-formed email signs in (ADR 0030). The guest's cart moves to the shopper, and a
// shopper with no orders yet gets the sample orders.
export class SignIn {
  constructor(
    private readonly sessions: SessionStore,
    private readonly cartLines: CartLineRepository,
    private readonly sampleOrderSeeder: SampleOrderSeeder,
    private readonly clock: Clock,
  ) {}

  async execute(request: SignInRequest): Promise<SignInResult> {
    const email = normaliseEmail(request.email);
    if (email === null) return { status: "invalid-email" };
    const previous = await this.sessions.current();
    const session = {
      email,
      // A cookie the browser handed back may hold anything; only a real ZIP code is kept.
      deliveryPostalCode:
        normalisePostalCode(previous?.deliveryPostalCode ?? "") ?? DEFAULT_POSTAL_CODE,
    };
    await this.sessions.save(session);
    const shopper = shopperFromSession(session);
    await this.moveGuestCart(shopper);
    await this.sampleOrderSeeder.seedIfNew(shopper);
    return { status: "signed-in", shopper: toShopperView(shopper) };
  }

  private async moveGuestCart(shopper: Shopper): Promise<void> {
    const guestLines = await this.cartLines.listByOwner(GUEST_SHOPPER_ID);
    const shopperLines = await this.cartLines.listByOwner(shopper.id);
    const now = this.clock.now();
    for (const line of mergeIntoCart(shopperLines, guestLines, shopper.id, now)) {
      await this.cartLines.save(line);
    }
    for (const line of guestLines) await this.cartLines.remove(GUEST_SHOPPER_ID, line.productId);
  }
}
