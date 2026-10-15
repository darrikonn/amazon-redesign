import { newOrder, orderIdFor, orderItemsFor, quantityLimitFor } from "@/component";
import type {
  CartLine,
  CartLineRepository,
  Clock,
  Order,
  OrderId,
  OrderRepository,
  Product,
  ProductDetailsRepository,
  ProductRepository,
  SessionStore,
  Shopper,
} from "@/core";
import { currentShopper } from "./session-shopper";

export type PlaceOrderResult =
  | { status: "placed"; orderId: OrderId }
  | { status: "unavailable"; productNames: readonly string[] }
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
    const products = await this.products.getMany(cartLines.map((line) => line.productId));
    if (products.length === 0) return { status: "empty-cart" };
    const unavailable = unavailableProducts(cartLines, products);
    if (unavailable.length > 0) {
      return { status: "unavailable", productNames: unavailable.map((product) => product.name) };
    }
    const order = await this.orderFromCart(shopper, cartLines, products);
    await this.orders.save(order);
    await this.emptyCart(shopper, cartLines);
    return { status: "placed", orderId: order.id };
  }

  private async orderFromCart(
    shopper: Shopper,
    cartLines: readonly CartLine[],
    products: readonly Product[],
  ): Promise<Order> {
    const productIds = cartLines.map((line) => line.productId);
    const placedAt = this.clock.now();
    const earlierOrders = await this.orders.listByOwner(shopper.id);
    return newOrder({
      id: orderIdFor(placedAt, earlierOrders.length),
      ownerId: shopper.id,
      isSample: false,
      placedAt,
      created: placedAt,
      deliveryPostalCode: shopper.deliveryPostalCode,
      items: orderItemsFor(cartLines, products, await this.productDetails.getMany(productIds)),
    });
  }

  private async emptyCart(shopper: Shopper, cartLines: readonly CartLine[]): Promise<void> {
    for (const cartLine of cartLines) await this.cartLines.remove(shopper.id, cartLine.productId);
  }
}

// Sold out, or wanted in more units than are left: the whole order waits, rather than
// arriving short of what the shopper chose.
function unavailableProducts(
  cartLines: readonly CartLine[],
  products: readonly Product[],
): Product[] {
  return products.filter((product) => {
    const line = cartLines.find((candidate) => candidate.productId === product.id);
    return line !== undefined && line.quantity > quantityLimitFor(product);
  });
}
