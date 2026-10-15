import { CART_RULES, lineTotalInCents, totalInCents } from "@/component";
import type {
  CartLine,
  CartLineRepository,
  CategoryId,
  ProductId,
  ProductRepository,
  SessionStore,
} from "@/core";
import { type CartSummary, summarizeCart } from "./cart-summary";
import { cartOwnerOf, currentShopper } from "./session-shopper";

export type CartLineView = {
  productId: ProductId;
  name: string;
  category: CategoryId;
  image: string | null;
  priceInCents: number;
  deliveryDays: number;
  quantity: number;
  rating: number;
  lineTotalInCents: number;
};

export type CartView = CartSummary & {
  lines: readonly CartLineView[];
  subtotalInCents: number;
  isSignedIn: boolean;
  maximumQuantity: number;
};

export class ViewCart {
  constructor(
    private readonly sessions: SessionStore,
    private readonly cartLines: CartLineRepository,
    private readonly products: ProductRepository,
  ) {}

  async execute(): Promise<CartView> {
    const shopper = await currentShopper(this.sessions);
    const lines = await this.cartLines.listByOwner(cartOwnerOf(shopper));
    return toCartView(lines, this.products, shopper !== null);
  }
}

// A line whose product left the catalogue is dropped from the view rather than shown
// without a name or price.
export async function toCartView(
  lines: readonly CartLine[],
  products: ProductRepository,
  isSignedIn: boolean,
): Promise<CartView> {
  const found = await products.getMany(lines.map((line) => line.productId));
  const views = lines.flatMap((line) => {
    const product = found.find((candidate) => candidate.id === line.productId);
    if (product === undefined) return [];
    return [
      {
        productId: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        priceInCents: product.priceInCents,
        deliveryDays: product.deliveryDays,
        quantity: line.quantity,
        rating: product.rating,
        lineTotalInCents: lineTotalInCents({
          priceInCents: product.priceInCents,
          quantity: line.quantity,
        }),
      },
    ];
  });
  const shown = lines.filter((line) => views.some((view) => view.productId === line.productId));
  return {
    ...summarizeCart(shown),
    lines: views,
    subtotalInCents: totalInCents(views),
    isSignedIn,
    maximumQuantity: CART_RULES.maximumQuantity,
  };
}
