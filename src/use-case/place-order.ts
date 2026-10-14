import { newOrder, orderIdFor } from "@/component";
import type {
  CartLineRepository,
  Clock,
  OrderId,
  OrderRepository,
  ProductDetailsRepository,
  ProductRepository,
  SessionStore,
} from "@/core";
import { currentShopper } from "./session-shopper";

export type PlaceOrderResult =
  | { status: "placed"; orderId: OrderId }
  | { status: "signed-out" }
  | { status: "empty-cart" };

// The cart becomes an order, delivered to the shopper's current location, and empties.
export class PlaceOrder {
  constructor(
    private readonly sessions: SessionStore,
    private readonly cartLines: CartLineRepository,
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
    private readonly productDetails: ProductDetailsRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<PlaceOrderResult> {
    const shopper = await currentShopper(this.sessions);
    if (shopper === null) return { status: "signed-out" };
    const cartLines = await this.cartLines.listByOwner(shopper.id);
    const productIds = cartLines.map((line) => line.productId);
    const products = await this.products.getMany(productIds);
    if (products.length === 0) return { status: "empty-cart" };
    const details = await this.productDetails.getMany(productIds);
    const placedAt = this.clock.now();
    const earlierOrders = await this.orders.listByOwner(shopper.id);
    const orderId = orderIdFor(placedAt, earlierOrders.length);
    await this.orders.save(
      newOrder({
        id: orderId,
        ownerId: shopper.id,
        isSample: false,
        placedAt,
        created: placedAt,
        deliveryPostalCode: shopper.deliveryPostalCode,
        items: cartLines.flatMap((cartLine) => {
          const product = products.find((candidate) => candidate.id === cartLine.productId);
          if (product === undefined) return [];
          const productDetails = details.find((entry) => entry.productId === product.id) ?? null;
          return [{ product, details: productDetails, quantity: cartLine.quantity }];
        }),
      }),
    );
    for (const cartLine of cartLines) await this.cartLines.remove(shopper.id, cartLine.productId);
    return { status: "placed", orderId };
  }
}
