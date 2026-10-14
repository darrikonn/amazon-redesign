import {
  DEFAULT_POSTAL_CODE,
  GUEST_SHOPPER_ID,
  mergeIntoCart,
  normaliseEmail,
  orderIdFor,
  orderLineFor,
  pickSamplePurchases,
  type SamplePurchase,
  shopperFromSession,
} from "@/component";
import type {
  CartLineRepository,
  Clock,
  Order,
  OrderRepository,
  ProductDetailsRepository,
  ProductRepository,
  SessionStore,
  Shopper,
} from "@/core";
import { type ShopperView, toShopperView } from "./view-session";

export type SignInRequest = {
  email: string;
};

export type SignInResult =
  | { status: "signed-in"; shopper: ShopperView }
  | { status: "invalid-email" };

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// Any well-formed email signs in (ADR 0030). The guest's cart moves to the shopper, and a
// shopper with no orders yet gets the sample orders.
export class SignIn {
  constructor(
    private readonly sessions: SessionStore,
    private readonly cartLines: CartLineRepository,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly productDetails: ProductDetailsRepository,
    private readonly clock: Clock,
  ) {}

  async execute(request: SignInRequest): Promise<SignInResult> {
    const email = normaliseEmail(request.email);
    if (email === null) return { status: "invalid-email" };
    const previous = await this.sessions.current();
    const session = {
      email,
      deliveryPostalCode: previous?.deliveryPostalCode ?? DEFAULT_POSTAL_CODE,
    };
    await this.sessions.save(session);
    const shopper = shopperFromSession(session);
    await this.moveGuestCart(shopper);
    await this.addSampleOrdersIfNew(shopper);
    return { status: "signed-in", shopper: toShopperView(shopper) };
  }

  private async moveGuestCart(shopper: Shopper): Promise<void> {
    const guestLines = await this.cartLines.listByOwner(GUEST_SHOPPER_ID);
    const shopperLines = await this.cartLines.listByOwner(shopper.id);
    for (const line of mergeIntoCart(shopperLines, guestLines, shopper.id)) {
      await this.cartLines.save(line);
    }
    for (const line of guestLines) await this.cartLines.remove(GUEST_SHOPPER_ID, line.productId);
  }

  private async addSampleOrdersIfNew(shopper: Shopper): Promise<void> {
    if ((await this.orders.listByOwner(shopper.id)).length > 0) return;
    const purchases = pickSamplePurchases(shopper.email, await this.products.list());
    const now = this.clock.now();
    for (const [index, purchase] of purchases.entries()) {
      await this.orders.save(await this.sampleOrder(shopper, purchase, index, now));
    }
  }

  private async sampleOrder(
    shopper: Shopper,
    purchase: SamplePurchase,
    index: number,
    now: Date,
  ): Promise<Order> {
    const placedAt = new Date(now.getTime() - purchase.daysAgo * DAY_IN_MILLISECONDS);
    const productIds = purchase.items.map((item) => item.productId);
    const products = await this.products.demandMany(productIds);
    const details = await this.productDetails.getMany(productIds);
    const lines = purchase.items.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (product === undefined) return [];
      const productDetails = details.find((entry) => entry.productId === item.productId) ?? null;
      return [orderLineFor(product, productDetails, item.quantity)];
    });
    return {
      id: orderIdFor(placedAt, index),
      ownerId: shopper.id,
      isSample: true,
      placedAt: placedAt.toISOString(),
      deliveryDays: Math.max(...products.map((product) => product.deliveryDays)),
      deliveryCity: shopper.deliveryCity,
      deliveryPostalCode: shopper.deliveryPostalCode,
      lines,
      returns: [],
    };
  }
}
